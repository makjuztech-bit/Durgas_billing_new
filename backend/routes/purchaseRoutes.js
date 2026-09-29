const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// GET all purchases
router.get('/', async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Purchase and Update Inventory
router.post('/', async (req, res) => {
    const purchaseData = req.body;

    const total = Number(purchaseData.totalAmount) || 0;
    const paid = Number(purchaseData.paidAmount) || 0;

    let paymentStatus = 'Credit';
    if (paid >= total) paymentStatus = 'Paid';
    else if (paid > 0) paymentStatus = 'Partial';

    try {
        const newPurchase = await Purchase.create({
            billNo: purchaseData.billNo || `PUR-${Date.now()}`,
            date: purchaseData.date || new Date().toISOString().split('T')[0],
            supplierId: purchaseData.supplierId || null,
            supplierName: purchaseData.supplierName || 'General Supplier',
            items: purchaseData.items || [],
            totalAmount: total,
            paidAmount: paid,
            dueAmount: Math.max(0, total - paid),
            paymentStatus: purchaseData.paymentStatus || paymentStatus,
            status: purchaseData.status || 'completed',
            purchaseType: purchaseData.purchaseType || 'gst'
        });

        // Process items into inventory
        if (Array.isArray(purchaseData.items)) {
            for (const item of purchaseData.items) {
                if (!item.barcode) continue;
                const existingProduct = await Product.findOne({ where: { barcode: item.barcode } });
                const addQty = Number(item.qty) || 0;

                if (existingProduct) {
                    const updatedQty = (existingProduct.stockQty || 0) + addQty;
                    await existingProduct.update({
                        stockQty: updatedQty,
                        purchasePrice: Number(item.costPrice) || existingProduct.purchasePrice,
                        sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : existingProduct.sellingPrice,
                        mrp: item.mrp ? Number(item.mrp) : existingProduct.mrp,
                        status: updatedQty > 0 ? 'available' : existingProduct.status
                    });
                } else {
                    await Product.create({
                        productCode: item.barcode,
                        barcode: item.barcode,
                        name: item.name || 'New Item',
                        category: item.category || 'Silk Sarees',
                        department: item.department || 'Womens',
                        brand: newPurchase.supplierName,
                        material: item.material || 'Silk',
                        sellingPrice: Number(item.sellingPrice) || 0,
                        purchasePrice: Number(item.costPrice) || 0,
                        mrp: Number(item.mrp) || 0,
                        stockQty: addQty,
                        supplier: newPurchase.supplierName,
                        status: 'available',
                        addedDate: new Date().toISOString().split('T')[0]
                    });
                }
            }
        }

        res.status(201).json(newPurchase);
    } catch (err) {
        console.error('Purchase creation error:', err);
        res.status(400).json({ message: err.message });
    }
});

// UPDATE Payment for a Purchase
router.patch('/:id/payment', async (req, res) => {
    const { amount } = req.body;
    try {
        const purchase = await Purchase.findByPk(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

        const addAmount = Number(amount) || 0;
        const newPaid = (purchase.paidAmount || 0) + addAmount;
        const newDue = Math.max(0, (purchase.totalAmount || 0) - newPaid);
        const paymentStatus = newPaid >= (purchase.totalAmount || 0) ? 'Paid' : 'Partial';

        await purchase.update({
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus
        });

        res.json(purchase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
