const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Adjustment = sequelize.define('Adjustment', {
    barcode: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    currentStock: { type: DataTypes.INTEGER, defaultValue: 0 },
    adjustQty: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.STRING, defaultValue: () => new Date().toISOString().split('T')[0] },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
}, { timestamps: true });

module.exports = Adjustment;

