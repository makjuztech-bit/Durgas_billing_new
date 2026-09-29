const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const { Op } = require('sequelize');

// Search customers (for autocomplete/quick search)
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const customers = await Customer.findAll({
            where: {
                [Op.or]: [
                    { mobile: { [Op.like]: `%${query}%` } },
                    { name: { [Op.like]: `%${query}%` } }
                ]
            },
            limit: 10
        });

        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all customers with aggregated stats
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll({
            order: [['name', 'ASC']]
        });

        const allBills = await Bill.findAll();
        const enriched = customers.map(cust => {
            const customerBills = allBills.filter(b => b.customerMobile === cust.mobile);
            const totalPurchase = customerBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
            const pendingDue = customerBills.reduce((sum, b) => sum + (b.dueAmount || 0), 0);
            return {
                id: cust.id,
                name: cust.name,
                mobile: cust.mobile,
                place: cust.place,
                type: cust.type,
                totalPurchase,
                totalPurchases: totalPurchase,
                billsCount: customerBills.length,
                visitCount: customerBills.length,
                pendingDue
            };
        });

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get customer history (Bills)
router.get('/:mobile/bills', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            where: { customerMobile: req.params.mobile },
            order: [['createdAt', 'DESC']]
        });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single customer
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create customer
router.post('/', async (req, res) => {
    try {
        const existing = await Customer.findOne({ where: { mobile: req.body.mobile } });
        if (existing) {
            await existing.update(req.body);
            return res.json(existing);
        }
        const newCustomer = await Customer.create(req.body);
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        await customer.update(req.body);
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        await customer.destroy();
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


