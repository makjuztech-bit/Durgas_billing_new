const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Purchase = sequelize.define('Purchase', {
    billNo: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    supplierId: { type: DataTypes.STRING, allowNull: true },
    supplierName: { type: DataTypes.STRING, allowNull: false },
    items: { type: DataTypes.JSON, defaultValue: [] },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    paidAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    dueAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'Credit' },
    status: { type: DataTypes.STRING, defaultValue: 'completed' },
    purchaseType: { type: DataTypes.STRING, defaultValue: 'gst' }
}, { timestamps: true });

module.exports = Purchase;

