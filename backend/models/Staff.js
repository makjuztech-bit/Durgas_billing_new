const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Staff = sequelize.define('Staff', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commissionType: {
        type: DataTypes.STRING,
        defaultValue: 'Percentage'
    },
    commissionValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    salesThisMonth: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Staff;

