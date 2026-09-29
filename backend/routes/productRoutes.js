const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Adjustment = require('../models/Adjustment');
const { Op } = require('sequelize');

// Middleware to map sareeCode to productCode & ensure barcode
const mapSareeCode = (req, res, next) => {
    if (req.body.sareeCode && !req.body.productCode) {
        req.body.productCode = req.body.sareeCode;
    }
    if (!req.body.barcode && req.body.productCode) {
        req.body.barcode = req.body.productCode;
    }
    if (!req.body.barcode) {
        req.body.barcode = `SK-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    if (!req.body.productCode) {
        req.body.productCode = req.body.barcode;
    }
    if (!req.body.category) {
        req.body.category = 'General';
    }
    next();
};

// GET low-stock products (threshold defaults to 5)
router.get('/low-stock', async (req, res) => {
    try {
        const threshold = Number(req.query.threshold) || 5;
        const lowStockProducts = await Product.findAll({
            where: {
                stockQty: {
                    [Op.lte]: threshold
                }
            },
            order: [['stockQty', 'ASC']]
        });
        res.json(lowStockProducts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all products
router.get('/', async (req, res) => {
    try {
        const where = {};
        if (req.query.department) where.department = req.query.department;
        if (req.query.category && req.query.category !== 'all') where.category = req.query.category;
        if (req.query.status) where.status = req.query.status;

        const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// IMPORT products in bulk
router.post('/import', async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'No products provided' });
        }

        let addedCount = 0;
        let updatedCount = 0;

        for (const item of products) {
            if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
                continue; // Skip invalid row missing product name
            }

            // Ensure barcode is preserved as string
            if (item.barcode !== undefined && item.barcode !== null) {
                item.barcode = String(item.barcode).trim();
            }
            if (!item.barcode) {
                item.barcode = `SK-${Math.floor(100000 + Math.random() * 900000)}`;
            }

            item.productCode = item.productCode || item.barcode;
            item.category = item.category || 'General';

            // Optional stock defaults to 1
            if (item.stockQty === undefined || item.stockQty === null || isNaN(Number(item.stockQty))) {
                item.stockQty = 1;
            } else {
                item.stockQty = Math.max(0, parseInt(item.stockQty, 10));
            }

            item.status = item.stockQty > 0 ? 'available' : 'sold';
            item.sellingPrice = Number(item.sellingPrice) || 0;
            item.purchasePrice = Number(item.purchasePrice) || item.sellingPrice || 0;
            item.mrp = Number(item.mrp) || item.sellingPrice || 0;

            const existingProduct = await Product.findOne({ where: { barcode: item.barcode } });
            
            if (existingProduct) {
                await existingProduct.update(item);
                updatedCount++;
            } else {
                await Product.create(item);
                addedCount++;
            }
        }

        res.json({ message: `Import successful. Added ${addedCount}, Updated ${updatedCount} products.` });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ message: err.message });
    }
});

// CREATE product
router.post('/', mapSareeCode, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.stockQty !== undefined) {
            data.stockQty = Number(data.stockQty);
            data.status = data.stockQty > 0 ? 'available' : 'sold';
        }
        const newProduct = await Product.create(data);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(400).json({ message: err.message });
    }
});

// QUICK ADJUST / ADD STOCK (+Qty or -Qty) with audit history
router.post('/:id/adjust-stock', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { adjustQty, reason, referenceNo } = req.body;
        const change = Number(adjustQty) || 0;
        const currentStock = product.stockQty || 0;
        const newStock = Math.max(0, currentStock + change);
        const newStatus = newStock > 0 ? 'available' : 'sold';

        await product.update({
            stockQty: newStock,
            status: newStatus
        });

        // Record audit trail in Adjustment table
        const adjustment = await Adjustment.create({
            barcode: product.barcode,
            name: product.name,
            currentStock: currentStock,
            adjustQty: change,
            reason: reason || (change >= 0 ? 'Stock Restock / Inward' : 'Stock Correction / Write-off'),
            date: new Date().toISOString().split('T')[0],
            status: 'approved'
        });

        res.json({
            success: true,
            product,
            adjustment
        });
    } catch (err) {
        console.error('Adjust stock error:', err);
        res.status(400).json({ message: err.message });
    }
});

// UPDATE product
router.put('/:id', mapSareeCode, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const data = { ...req.body };
        if (data.stockQty !== undefined) {
            data.stockQty = Number(data.stockQty);
            data.status = data.stockQty > 0 ? 'available' : 'sold';
        }

        await product.update(data);
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', mapSareeCode, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const data = { ...req.body };
        if (data.stockQty !== undefined) {
            data.stockQty = Number(data.stockQty);
            data.status = data.stockQty > 0 ? 'available' : 'sold';
        }

        await product.update(data);
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
