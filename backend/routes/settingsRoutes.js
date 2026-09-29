const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Official Durgas default data
const OFFICIAL_SETTINGS = {
    shopName: 'DURGAS',
    shopNameTamil: 'துர்காஸ்',
    tagline: 'EXCLUSIVE GOLD & DIAMOND JEWELLERY',
    slogan: 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES',
    since: 'SINCE 2026',
    address1: 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street',
    address2: 'Kanchipuram - 631 501',
    addressTamil: 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.',
    phone: '044 46621728, 89251 55521, 89251 55526',
    phoneLandline: '044 46621728',
    phoneMobile1: '89251 55521',
    phoneMobile2: '89251 55526',
    email: 'durgaspos@gmail.com',
    gstNo: '33BWZPN2210D1ZO',
    logoUrl: '/logo.png',
    currency: 'INR',
    taxRate: 5
};

// GET settings (always returns the first record or creates/updates default Durgas settings)
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(OFFICIAL_SETTINGS);
        } else if (settings.gstNo === '33AAAAA0000A1Z5' || !settings.shopNameTamil || settings.shopName === 'SRI KANDAN FAMILY SHOP') {
            // Auto-upgrade legacy settings to official Durgas details
            await settings.update(OFFICIAL_SETTINGS);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE settings
router.put('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

