const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Expense = sequelize.define('Expense', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        defaultValue: () => new Date().toISOString().split('T')[0]
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Expense;

