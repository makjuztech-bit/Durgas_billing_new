const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Bill = sequelize.define('Bill', {
    billNo: {
        type: DataTypes.STRING,
        unique: true
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerMobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerPlace: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerType: {
        type: DataTypes.STRING,
        defaultValue: 'retail'
    },
    customerGst: {
        type: DataTypes.STRING,
        allowNull: true
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discountPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    gstAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    roundOff: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Paid'
    },
    dueAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    date: {
        type: DataTypes.STRING,
        defaultValue: () => new Date().toISOString().split('T')[0]
    }
}, {
    timestamps: true
});

Bill.beforeCreate(async (bill, options) => {
    if (!bill.billNo) {
        const lastBill = await Bill.findOne({ order: [['id', 'DESC']] });
        const nextId = (lastBill && lastBill.id) ? (lastBill.id + 1) : Date.now().toString().slice(-4);
        bill.billNo = `INV-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
    }
});

module.exports = Bill;
