const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Return = sequelize.define('Return', {
    originalBillId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalBillNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerMobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    items: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    totalRefundAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    refundMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cash'
    },
    date: {
        type: DataTypes.STRING,
        defaultValue: () => new Date().toISOString().split('T')[0]
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'completed'
    },
    processedBy: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Return;
