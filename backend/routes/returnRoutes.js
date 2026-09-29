const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Bill = require('../models/Bill');
const Product = require('../models/Product');

// Process a return
router.post('/', async (req, res) => {
    const { originalBillId, itemsToReturn, totalRefundAmount, refundMethod, processedBy } = req.body;

    try {
        let originalBillNumber = 'UNKNOWN';
        let customerName = '';
        let customerMobile = '';

        if (originalBillId) {
            const bill = await Bill.findByPk(originalBillId);
            if (bill) {
                originalBillNumber = bill.billNo;
                customerName = bill.customerName;
                customerMobile = bill.customerMobile;
            }
        }

        const rawItems = itemsToReturn || req.body.items || [];
        const returnedItems = [];

        if (Array.isArray(rawItems)) {
            for (const returnItem of rawItems) {
                const qtyToReturn = Number(returnItem.qty) || 1;

                // Restock product in SQLite by barcode or ID
                const searchWhere = [];
                if (returnItem.productId || returnItem.id) {
                    searchWhere.push({ id: returnItem.productId || returnItem.id });
                }
                if (returnItem.barcode) {
                    searchWhere.push({ barcode: returnItem.barcode });
                }

                if (searchWhere.length > 0) {
                    const product = await Product.findOne({
                        where: { [require('sequelize').Op.or]: searchWhere }
                    });
                    if (product) {
                        const newQty = (product.stockQty || 0) + qtyToReturn;
                        await product.update({
                            stockQty: newQty,
                            status: newQty > 0 ? 'available' : product.status
                        });
                    }
                }

                returnedItems.push({
                    barcode: returnItem.barcode,
                    name: returnItem.name || 'Returned Item',
                    qty: qtyToReturn,
                    price: Number(returnItem.price) || 0,
                    refundAmount: Number(returnItem.refundAmount) || 0,
                    condition: returnItem.condition || 'good'
                });
            }
        }

        const newReturn = await Return.create({
            originalBillId: String(originalBillId || 'DIRECT'),
            originalBillNumber: req.body.originalBillNumber || originalBillNumber,
            customerName: req.body.customerName || customerName,
            customerMobile: req.body.customerMobile || customerMobile,
            items: returnedItems,
            totalRefundAmount: Number(totalRefundAmount) || 0,
            refundMethod: refundMethod || 'cash',
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            processedBy: processedBy || 'Admin'
        });

        res.status(201).json({
            message: 'Return processed successfully',
            return: newReturn
        });
    } catch (err) {
        console.error('Error processing return:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET all returns
router.get('/', async (req, res) => {
    try {
        const returns = await Return.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
