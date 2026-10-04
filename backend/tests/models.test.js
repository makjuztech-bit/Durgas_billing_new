/**
 * Comprehensive Database Models Test Suite
 * Tests all 13 Sequelize models directly against SQLite.
 * Run with: node backend/tests/models.test.js
 */

const sequelize = require('../database');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Supplier = require('../models/Supplier');
const Bill = require('../models/Bill');
const Purchase = require('../models/Purchase');
const Return = require('../models/Return');
const Adjustment = require('../models/Adjustment');
const Order = require('../models/Order');
const Alteration = require('../models/Alteration');
const Expense = require('../models/Expense');
const Settings = require('../models/Settings');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✔ PASS: ${message}`);
        passedTests++;
    } else {
        console.error(`  ✖ FAIL: ${message}`);
        failedTests++;
    }
}

async function runModelTests() {
    console.log('='.repeat(65));
    console.log('   DURGAS POS: DATABASE MODELS TEST SUITE (13 MODELS)');
    console.log('='.repeat(65));

    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('SQLite Database Connected & Schema Synced\n');

        const testSuffix = Date.now().toString().slice(-6);
        const todayDate = new Date().toISOString().split('T')[0];

        // 1. User Model
        console.log('[1/13] Testing User Model...');
        const user = await User.create({
            username: `cashier_${testSuffix}`,
            password: 'secretPassword123',
            role: 'staff',
            name: 'Kavitha Sales'
        });
        assert(user.id && user.role === 'staff', 'User model created with role "staff"');
        const foundUser = await User.findOne({ where: { username: `cashier_${testSuffix}` } });
        assert(foundUser && foundUser.name === 'Kavitha Sales', 'User fetched successfully by username');

        // 2. Product Model
        console.log('\n[2/13] Testing Product Model...');
        const product = await Product.create({
            productCode: `SR-${testSuffix}`,
            barcode: `SK-${testSuffix}`,
            name: 'Kanchipuram Silk Saree Bridal Red',
            nameTamil: 'காஞ்சிபுரம் பட்டு புடவை',
            category: 'Silk Sarees',
            department: 'Womens',
            sellingPrice: 12500,
            purchasePrice: 8500,
            mrp: 14999,
            gstPercent: 5,
            stockQty: 10,
            stockType: 'unique',
            rackLocation: 'Rack A1',
            status: 'available'
        });
        assert(product.id && product.barcode === `SK-${testSuffix}`, 'Product model created with SKU & Tamil name');
        
        // Test stock decrement
        await product.decrement('stockQty', { by: 2 });
        await product.reload();
        assert(product.stockQty === 8, 'Product stock atomically decremented from 10 to 8');

        // 3. Customer Model
        console.log('\n[3/13] Testing Customer Model...');
        const customer = await Customer.create({
            name: 'Meenakshi Sundaram',
            mobile: `9876${testSuffix}`,
            place: 'Kanchipuram',
            type: 'Retail',
            gstin: '33AAAPL1234M1Z1'
        });
        assert(customer.id && customer.name === 'Meenakshi Sundaram' && customer.place === 'Kanchipuram', 'Customer created with profile details & GSTIN');

        // 4. Staff Model
        console.log('\n[4/13] Testing Staff Model...');
        const staff = await Staff.create({
            name: 'Ravi Kumar',
            role: 'Senior Sales Executive',
            commissionType: 'Percentage',
            commissionValue: 2.5,
            salesThisMonth: 145000,
            active: true
        });
        assert(staff.id && staff.commissionValue === 2.5 && staff.active === true, 'Staff executive created with commission');

        // 5. Supplier Model
        console.log('\n[5/13] Testing Supplier Model...');
        const supplier = await Supplier.create({
            name: 'Venkateshwara Silk Weavers',
            contactPerson: 'Suresh Rao',
            mobile: `9944${testSuffix}`,
            gstin: '33AABCV1234F1Z5',
            location: 'Salem',
            pendingDue: 45000
        });
        assert(supplier.id && supplier.gstin === '33AABCV1234F1Z5', 'Supplier ledger created with GSTIN & pending due');

        // 6. Bill Model (Invoices)
        console.log('\n[6/13] Testing Bill Model...');
        const bill = await Bill.create({
            billNo: `INV-${testSuffix}`,
            customerName: customer.name,
            customerMobile: customer.mobile,
            items: [
                {
                    barcode: product.barcode,
                    name: product.name,
                    qty: 2,
                    sellingPrice: 12500,
                    total: 25000
                }
            ],
            subtotal: 25000,
            discountPercent: 5,
            discountAmount: 1250,
            gstAmount: 1187.5,
            roundOff: -0.5,
            grandTotal: 24937,
            paymentMethod: 'UPI',
            status: 'Paid',
            dueAmount: 0,
            date: todayDate
        });
        assert(bill.id && Array.isArray(bill.items) && bill.grandTotal === 24937, 'Bill created with JSON items array and grand total');

        // 7. Purchase Model
        console.log('\n[7/13] Testing Purchase Model...');
        const purchase = await Purchase.create({
            billNo: `PUR-${testSuffix}`,
            date: todayDate,
            supplierId: String(supplier.id),
            supplierName: supplier.name,
            items: [{ name: 'Raw Silk Rolls', qty: 20, costPrice: 2000, totalCost: 40000 }],
            totalAmount: 40000,
            paidAmount: 30000,
            dueAmount: 10000,
            paymentStatus: 'Partial',
            status: 'completed',
            purchaseType: 'gst'
        });
        assert(purchase.id && purchase.dueAmount === 10000 && purchase.date === todayDate, 'Inward purchase entry created with partial payment');

        // 8. Return Model
        console.log('\n[8/13] Testing Return Model...');
        const returnEntry = await Return.create({
            originalBillId: String(bill.id),
            originalBillNumber: bill.billNo,
            customerName: customer.name,
            customerMobile: customer.mobile,
            items: [{ barcode: product.barcode, name: product.name, qty: 1 }],
            totalRefundAmount: 12500,
            refundMethod: 'Cash',
            reason: 'Color mismatch - customer exchange'
        });
        assert(returnEntry.id && returnEntry.totalRefundAmount === 12500, 'Customer return processed with refund amount');

        // 9. Adjustment Model (Stock Audit)
        console.log('\n[9/13] Testing Adjustment Model...');
        const adjustment = await Adjustment.create({
            barcode: product.barcode,
            name: product.name,
            currentStock: 8,
            adjustQty: -1,
            reason: 'Display rack fabric thread pull damage',
            status: 'approved'
        });
        assert(adjustment.id && adjustment.adjustQty === -1 && adjustment.status === 'approved', 'Stock audit adjustment recorded');

        // 10. Order Model (Advance Bookings)
        console.log('\n[10/13] Testing Order Model...');
        const order = await Order.create({
            customerName: 'Ananya Sharma',
            customerMobile: '9443312345',
            description: 'Custom Wedding Kanchipuram Saree with Gold Zari Pallu',
            deliveryDate: '2026-11-20',
            totalEstimated: 45000,
            advancePaid: 15000,
            status: 'Booked',
            orderDate: todayDate
        });
        assert(order.id && order.advancePaid === 15000 && order.status === 'Booked', 'Advance customer booking logged');

        // 11. Alteration Model
        console.log('\n[11/13] Testing Alteration Model...');
        const alteration = await Alteration.create({
            customer: 'Revathi S',
            mobile: '9789012345',
            items: 'Pattu Pavadai & Blouse',
            services: ['Fall', 'Pico', 'Waist Alteration'],
            status: 'In Progress',
            deliveryDate: '2026-10-08',
            amount: 450
        });
        assert(alteration.id && alteration.status === 'In Progress' && alteration.amount === 450, 'Tailoring alteration job tracked');

        // 12. Expense Model
        console.log('\n[12/13] Testing Expense Model...');
        const expense = await Expense.create({
            type: 'Electricity / Power',
            amount: 3200,
            note: 'Showroom AC electricity bill for September',
            date: todayDate
        });
        assert(expense.id && expense.amount === 3200, 'Daily shop operating expense recorded');

        // 13. Settings Model
        console.log('\n[13/13] Testing Settings Model...');
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                shopName: 'DURGAS TEXTILES & JEWELLERY',
                shopNameTamil: 'துர்காஸ் டெக்ஸ்டைல்ஸ்',
                phone: '044 46621728',
                gstNo: '33BWZPN2210D1ZO',
                primaryColor: '#065f3d'
            });
        }
        assert(settings.id && settings.shopName.includes('DURGAS'), 'Settings model verified with shop branding');

        // Cleanup test entries
        console.log('\nCleaning up model test entries...');
        await user.destroy();
        await product.destroy();
        await customer.destroy();
        await staff.destroy();
        await supplier.destroy();
        await bill.destroy();
        await purchase.destroy();
        await returnEntry.destroy();
        await adjustment.destroy();
        await order.destroy();
        await alteration.destroy();
        await expense.destroy();
        console.log('Cleanup completed successfully.');

        console.log('\n' + '='.repeat(65));
        console.log(`MODEL TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
        console.log('='.repeat(65));

        process.exit(failedTests > 0 ? 1 : 0);
    } catch (err) {
        console.error('Fatal Error during Model Testing:', err);
        process.exit(1);
    }
}

runModelTests();
