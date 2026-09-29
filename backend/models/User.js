const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'salesman' },
    branch: { type: DataTypes.STRING, defaultValue: 'main' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = User;

