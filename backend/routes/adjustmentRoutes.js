const express = require('express');
const router = express.Router();
const Adjustment = require('../models/Adjustment');
const Product = require('../models/Product');

// GET all adjustments
router.get('/', async (req, res) => {
    try {
        const adjustments = await Adjustment.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(adjustments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Adjustment and update Product stock
router.post('/', async (req, res) => {
    try {
        const { barcode, name, currentStock, adjustQty, reason, status } = req.body;
        const qtyNum = Number(adjustQty) || 0;

        const newAdjustment = await Adjustment.create({
            barcode,
            name: name || 'Stock Adjustment',
            currentStock: currentStock !== undefined ? Number(currentStock) : 0,
            adjustQty: qtyNum,
            reason: reason || 'Manual Adjustment',
            date: new Date().toISOString().split('T')[0],
            status: status || 'approved'
        });

        // Update product stock in SQLite
        if (barcode) {
            const product = await Product.findOne({ where: { barcode } });
            if (product) {
                const updatedQty = Math.max(0, (product.stockQty || 0) + qtyNum);
                await product.update({
                    stockQty: updatedQty,
                    status: updatedQty > 0 ? 'available' : 'sold'
                });
            }
        }

        res.status(201).json(newAdjustment);
    } catch (err) {
        console.error('Error creating adjustment:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
