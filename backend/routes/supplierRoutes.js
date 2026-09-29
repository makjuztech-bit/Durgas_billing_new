const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// GET all
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({ order: [['name', 'ASC']] });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json(newSupplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        await supplier.update(req.body);
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        await supplier.update(req.body);
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        await supplier.destroy();
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

