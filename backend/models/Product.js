const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('Product', {
    productCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameTamil: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    department: {
        type: DataTypes.STRING,
        defaultValue: 'Womens'
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    material: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    zariType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    borderType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    length: {
        type: DataTypes.STRING,
        allowNull: true
    },
    weight: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blouseIncluded: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    blousePiece: {
        type: DataTypes.STRING,
        allowNull: true
    },
    purchasePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    sellingPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    mrp: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    gstPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    },
    stockType: {
        type: DataTypes.STRING,
        defaultValue: 'unique'
    },
    stockQty: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    rackLocation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    supplier: {
        type: DataTypes.STRING,
        allowNull: true
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'available'
    },
    addedDate: {
        type: DataTypes.STRING,
        defaultValue: () => new Date().toISOString().split('T')[0]
    }
}, {
    timestamps: true
});

module.exports = Product;

