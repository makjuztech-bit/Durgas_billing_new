const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Supplier = sequelize.define('Supplier', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactPerson: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gstin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pendingDue: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Supplier;

