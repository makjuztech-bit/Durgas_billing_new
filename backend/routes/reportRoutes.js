const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const { Op } = require('sequelize');

// Summary Report
router.get('/summary', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            where: {
                status: { [Op.in]: ['Paid', 'Due'] }
            }
        });
        const totalSales = bills.reduce((acc, bill) => acc + (bill.grandTotal || 0), 0);
        const billsCount = bills.length;
        const avgBillValue = billsCount > 0 ? Math.round(totalSales / billsCount) : 0;
        const profitEstimate = Math.round(totalSales * 0.2);

        res.json({
            totalSales,
            billsCount,
            avgBillValue,
            profitEstimate
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Detailed Report
router.get('/detailed', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            where: { status: { [Op.in]: ['Paid', 'Due'] } },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        const detailed = bills.map(bill => ({
            id: bill.id || bill.billNo,
            date: bill.date || new Date(bill.createdAt).toISOString().split('T')[0],
            category: 'Silk Sarees & Apparel',
            cash: (bill.paymentMethod === 'Cash' || bill.paymentMethod === 'CASH') ? bill.grandTotal : 0,
            card: (bill.paymentMethod !== 'Cash' && bill.paymentMethod !== 'CASH') ? bill.grandTotal : 0,
            totalAmount: bill.grandTotal
        }));

        res.json(detailed);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GST Report
router.get('/gst', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            where: { status: { [Op.ne]: 'Cancelled' } }
        });

        let totalTaxable = 0;
        let totalTax = 0;
        let b2bCount = 0;

        const hsnMap = {
            '5007': { code: '5007', description: 'Woven fabrics of Silk (Sarees)', taxable: 0, tax: 0, rate: 5 }
        };

        bills.forEach(bill => {
            const taxable = bill.subtotal || (bill.grandTotal - (bill.taxAmount || bill.gstAmount || 0));
            const tax = bill.taxAmount || bill.gstAmount || Math.round(taxable * 0.05);

            totalTaxable += taxable;
            totalTax += tax;

            if (bill.customerGst || bill.customerType === 'Wholesale') {
                b2bCount++;
            }

            hsnMap['5007'].taxable += taxable;
            hsnMap['5007'].tax += tax;
        });

        res.json({
            totalTaxable,
            totalTax,
            b2bCount,
            hsnSummary: Object.values(hsnMap)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Best Selling Categories
router.get('/bestselling', async (req, res) => {
    try {
        const bills = await Bill.findAll({
            where: { status: { [Op.ne]: 'Cancelled' } }
        });

        const categoryStats = {};
        bills.forEach(bill => {
            (bill.items || []).forEach(item => {
                const cat = item.category || 'Silk Sarees';
                if (!categoryStats[cat]) {
                    categoryStats[cat] = { sales: 0, revenue: 0 };
                }
                const qty = item.qty || 1;
                categoryStats[cat].sales += qty;
                categoryStats[cat].revenue += item.total || (qty * (item.sellingPrice || 0));
            });
        });

        const result = Object.entries(categoryStats)
            .map(([name, stats]) => ({
                name,
                sales: stats.sales,
                rawRevenue: stats.revenue,
                revenue: `₹${stats.revenue.toLocaleString('en-IN')}`
            }))
            .sort((a, b) => b.rawRevenue - a.rawRevenue)
            .slice(0, 4)
            .map(({ name, sales, revenue }) => ({ name, sales, revenue }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Backup Data (Full Export)
router.get('/backup', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        const products = await Product.findAll();
        const bills = await Bill.findAll({ order: [['createdAt', 'DESC']] });
        const expenses = await Expense.findAll({ order: [['createdAt', 'DESC']] });

        res.json({
            customers,
            inventory: products,
            bills,
            expenses,
            meta: {
                timestamp: new Date(),
                counts: {
                    customers: customers.length,
                    inventory: products.length,
                    bills: bills.length,
                    expenses: expenses.length
                }
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

