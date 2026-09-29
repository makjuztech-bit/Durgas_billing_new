const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Settings = sequelize.define('Settings', {
    shopName: {
        type: DataTypes.STRING,
        defaultValue: 'DURGAS'
    },
    shopNameTamil: {
        type: DataTypes.STRING,
        defaultValue: 'துர்காஸ்'
    },
    tagline: {
        type: DataTypes.STRING,
        defaultValue: 'EXCLUSIVE GOLD & DIAMOND JEWELLERY'
    },
    slogan: {
        type: DataTypes.STRING,
        defaultValue: 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES'
    },
    since: {
        type: DataTypes.STRING,
        defaultValue: 'SINCE 2026'
    },
    address1: {
        type: DataTypes.STRING,
        defaultValue: 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street'
    },
    address2: {
        type: DataTypes.STRING,
        defaultValue: 'Kanchipuram - 631 501'
    },
    addressTamil: {
        type: DataTypes.STRING,
        defaultValue: 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.'
    },
    phone: {
        type: DataTypes.STRING,
        defaultValue: '044 46621728, 89251 55521, 89251 55526'
    },
    phoneLandline: {
        type: DataTypes.STRING,
        defaultValue: '044 46621728'
    },
    phoneMobile1: {
        type: DataTypes.STRING,
        defaultValue: '89251 55521'
    },
    phoneMobile2: {
        type: DataTypes.STRING,
        defaultValue: '89251 55526'
    },
    email: {
        type: DataTypes.STRING,
        defaultValue: 'durgaspos@gmail.com'
    },
    gstNo: {
        type: DataTypes.STRING,
        defaultValue: '33BWZPN2210D1ZO'
    },
    logoUrl: {
        type: DataTypes.STRING,
        defaultValue: '/logo.png'
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    taxRate: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    }
}, {
    timestamps: true
});

module.exports = Settings;

