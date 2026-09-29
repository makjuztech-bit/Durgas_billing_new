const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// GET all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SEARCH Bills by number or mobile
router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const bills = await Bill.findAll({
            where: {
                [Op.or]: [
                    { billNo: { [Op.like]: `%${query}%` } },
                    { customerMobile: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET active bill by ID (or billNumber)
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findByPk(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Bill
router.post('/', async (req, res) => {
    try {
        const newBill = await Bill.create(req.body);

        // Deduct inventory stock for each sold item
        if (Array.isArray(req.body.items)) {
            for (const item of req.body.items) {
                const searchCriteria = [];
                if (item.sareeId || item.id) searchCriteria.push({ id: item.sareeId || item.id });
                if (item.barcode) searchCriteria.push({ barcode: item.barcode });
                if (item.sareeCode || item.productCode) searchCriteria.push({ productCode: item.sareeCode || item.productCode });

                if (searchCriteria.length > 0) {
                    const product = await Product.findOne({
                        where: { [Op.or]: searchCriteria }
                    });
                    if (product) {
                        const reduceQty = item.qty || 1;
                        product.stockQty = Math.max(0, (product.stockQty || 1) - reduceQty);
                        if (product.stockType === 'unique' && product.stockQty === 0) {
                            product.status = 'sold';
                        }
                        await product.save();
                    }
                }
            }
        }

        res.status(201).json(newBill);
    } catch (err) {
        console.error('Create bill error:', err);
        res.status(400).json({ message: err.message });
    }
});


// UPDATE Bill Status (Collect Payment / Cancel)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, dueAmount } = req.body;
        const bill = await Bill.findByPk(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        bill.status = status || bill.status;
        if (dueAmount !== undefined) bill.dueAmount = dueAmount;

        await bill.save();
        res.json(bill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE All Bills (Wipe sales history / test records)
router.delete('/', async (req, res) => {
    try {
        const deletedCount = await Bill.destroy({ where: {}, truncate: false });
        res.json({ message: 'All bills deleted successfully', count: deletedCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE Bill by ID or billNo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const whereCondition = isNaN(Number(id))
            ? { billNo: id }
            : { [Op.or]: [{ id: Number(id) }, { billNo: id }] };

        const bill = await Bill.findOne({ where: whereCondition });
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        // Restore stock for deleted bill items
        if (Array.isArray(bill.items)) {
            for (const item of bill.items) {
                if (item.barcode) {
                    const product = await Product.findOne({ where: { barcode: item.barcode } });
                    if (product) {
                        const restoredQty = (product.stockQty || 0) + (Number(item.qty) || 1);
                        await product.update({
                            stockQty: restoredQty,
                            status: restoredQty > 0 ? 'available' : product.status
                        });
                    }
                }
            }
        }

        await bill.destroy();
        res.json({ message: 'Bill deleted and inventory restored successfully', billNo: bill.billNo });
    } catch (err) {
        console.error('Delete bill error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
