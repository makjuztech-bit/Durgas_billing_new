const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define('Order', {
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerMobile: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    deliveryDate: { type: DataTypes.STRING, allowNull: true },
    totalEstimated: { type: DataTypes.FLOAT, defaultValue: 0 },
    advancePaid: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'Booked' },
    orderDate: { type: DataTypes.STRING, defaultValue: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = Order;

