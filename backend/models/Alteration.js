const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Alteration = sequelize.define('Alteration', {
    customer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    items: {
        type: DataTypes.STRING,
        allowNull: false
    },
    services: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    deliveryDate: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Alteration;
