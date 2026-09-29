const express = require('express');
const router = express.Router();
const Alteration = require('../models/Alteration');

router.get('/', async (req, res) => {
    try {
        const alterations = await Alteration.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(alterations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newAlteration = await Alteration.create(req.body);
        res.status(201).json(newAlteration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const alteration = await Alteration.findByPk(req.params.id);
        if (!alteration) return res.status(404).json({ message: 'Alteration not found' });
        await alteration.update(req.body);
        res.json(alteration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
