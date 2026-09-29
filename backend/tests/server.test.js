/**
 * Durgas Billing & Inventory - Live Server Integration Test Suite
 * Executes comprehensive integration tests against the live Express + SQLite server.
 */

const assert = require('assert');
const { app } = require('../server');
const sequelize = require('../database');
const http = require('http');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m'
};

async function runTests() {
    await sequelize.sync({ alter: true });
    // Spin up an isolated live instance on an ephemeral port (port 0)
    const testServer = http.createServer(app);
    await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
    const testPort = testServer.address().port;
    const API_URL = `http://127.0.0.1:${testPort}/api`;

    console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}   DURGAS - EXPANDED LIVE SERVER TEST SUITE           ${colors.reset}`);
    console.log(`${colors.cyan}   Target: ${API_URL} (Live Express + SQLite)${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

    let passedCount = 0;
    let failedCount = 0;
    let createdProductId = null;
    let createdBillId = null;
    let createdAlterationId = null;
    let createdReturnId = null;
    let createdCustomerId = null;
    let createdExpenseId = null;
    let authToken = null;
    const testBarcode = `TEST-${Date.now().toString().slice(-6)}`;

    async function test(name, fn) {
        const start = Date.now();
        try {
            await fn();
            const elapsed = Date.now() - start;
            console.log(`  ${colors.green}✔ PASS${colors.reset}  ${name} ${colors.yellow}(${elapsed}ms)${colors.reset}`);
            passedCount++;
        } catch (err) {
            const elapsed = Date.now() - start;
            console.error(`  ${colors.red}✖ FAIL${colors.reset}  ${name} ${colors.yellow}(${elapsed}ms)${colors.reset}`);
            console.error(`     ${colors.red}${err.message}${colors.reset}`);
            failedCount++;
        }
    }

    try {
        // 1. Health check
        await test('1. Server Health Check & SQLite Connection', async () => {
            const res = await fetch(`${API_URL}/health`);
            assert.strictEqual(res.status, 200, `Health check returned HTTP ${res.status}`);
            const data = await res.json();
            assert.strictEqual(data.status, 'ok');
            assert.strictEqual(data.database, 'sqlite connected');
        });

        // 2. Auth Login (Valid Admin)
        await test('2. Auth Login with Valid Admin Credentials', async () => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'admin123' })
            });
            assert.strictEqual(res.status, 200, `Expected HTTP 200, got ${res.status}`);
            const data = await res.json();
            assert.strictEqual(data.username, 'admin');
            assert.ok(data.token, 'Should return authentication token');
            authToken = data.token;
        });

        // 3. Auth Login Rejection (Invalid Password)
        await test('3. Auth Login Rejection with Invalid Password', async () => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
            });
            assert.strictEqual(res.status, 401, 'Should reject with HTTP 401');
        });

        // 4. Session Verification via Token (/api/auth/me)
        await test('4. Session Verification via Bearer Token (/api/auth/me)', async () => {
            assert.ok(authToken, 'Cannot test without authToken');
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            assert.strictEqual(res.status, 200);
            const user = await res.json();
            assert.strictEqual(user.username, 'admin');
            assert.strictEqual(user.role, 'admin');
        });

        // 5. Product Creation without Category (Defaults to General)
        await test('5. Create Product with Name and Barcode (Category defaults to General)', async () => {
            const payload = {
                name: 'Pure Kanchipuram Silk Saree Test Edition',
                nameTamil: 'காஞ்சிபுரம் பட்டு டெஸ்ட்',
                barcode: testBarcode,
                rackLocation: 'Rack T-01',
                purchasePrice: 4200,
                sellingPrice: 6500,
                mrp: 7999,
                stockQty: 8
            };

            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            assert.strictEqual(res.status, 201);
            const data = await res.json();
            assert.ok(data.id);
            assert.strictEqual(data.name, payload.name);
            assert.strictEqual(data.barcode, testBarcode);
            assert.strictEqual(data.category, 'General');
            assert.strictEqual(data.stockQty, 8);
            assert.strictEqual(data.status, 'available');

            createdProductId = data.id;
        });

        // 6. Fetch Product by ID
        await test('6. Fetch Created Product by ID', async () => {
            assert.ok(createdProductId);
            const res = await fetch(`${API_URL}/products/${createdProductId}`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.barcode, testBarcode);
            assert.strictEqual(data.sellingPrice, 6500);
        });

        // 7. Quick Restock / Stock Adjustment (+12 units)
        await test('7. Quick Restock / Stock Adjustment (+12 units)', async () => {
            assert.ok(createdProductId);
            const res = await fetch(`${API_URL}/products/${createdProductId}/adjust-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adjustQty: 12,
                    reason: 'Inward Weaver Shipment',
                    referenceNo: 'INV-TEST-001'
                })
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.product.stockQty, 20); // 8 + 12
            assert.strictEqual(data.adjustment.adjustQty, 12);
        });

        // 8. Adjustments Audit Trail
        await test('8. Adjustments Audit Trail Records Verification', async () => {
            const res = await fetch(`${API_URL}/adjustments`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            const found = data.find(a => a.barcode === testBarcode);
            assert.ok(found);
            assert.strictEqual(found.adjustQty, 12);
        });

        // 9. Billing & Stock Deduction
        await test('9. Bill Generation with Real-Time Stock Deduction (Sell 5 units)', async () => {
            assert.ok(createdProductId);
            const billPayload = {
                customerName: 'Test Buyer',
                customerMobile: '9988776655',
                items: [
                    {
                        barcode: testBarcode,
                        name: 'Pure Kanchipuram Silk Saree Test Edition',
                        qty: 5,
                        sellingPrice: 6500,
                        mrp: 7999
                    }
                ],
                subtotal: 32500,
                discountAmount: 0,
                taxAmount: 1625,
                grandTotal: 34125,
                paymentMethod: 'Cash',
                status: 'Paid'
            };

            const res = await fetch(`${API_URL}/bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billPayload)
            });

            assert.strictEqual(res.status, 201);
            const bill = await res.json();
            createdBillId = bill.id;

            // Check SQLite Product stock: 20 - 5 = 15
            const productRes = await fetch(`${API_URL}/products/${createdProductId}`);
            const product = await productRes.json();
            assert.strictEqual(product.stockQty, 15);
        });

        // 10. Bill Deletion & Stock Restoration
        await test('10. Bill Cancellation with Stock Restoration (+5 units)', async () => {
            assert.ok(createdBillId);
            const res = await fetch(`${API_URL}/bills/${createdBillId}`, {
                method: 'DELETE'
            });
            assert.strictEqual(res.status, 200);

            // Check SQLite Product stock: 15 + 5 = 20 restored!
            const productRes = await fetch(`${API_URL}/products/${createdProductId}`);
            const product = await productRes.json();
            assert.strictEqual(product.stockQty, 20);
        });

        // 11. Customer Creation & Dues Query
        await test('11. Customer Creation & Dues Query', async () => {
            const customerPayload = {
                name: 'Meenakshi Sundaram',
                mobile: '9840112233',
                place: 'Kanchipuram',
                type: 'retail'
            };

            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerPayload)
            });

            assert.strictEqual(res.status, 201);
            const customer = await res.json();
            assert.ok(customer.id);
            assert.strictEqual(customer.name, 'Meenakshi Sundaram');
            createdCustomerId = customer.id;

            // Query customers
            const listRes = await fetch(`${API_URL}/customers`);
            assert.strictEqual(listRes.status, 200);
            const list = await listRes.json();
            assert.ok(list.some(c => c.id === createdCustomerId));
        });

        // 12. Store Expenses Logging
        await test('12. Store Expenses Logging and Tallying', async () => {
            const expensePayload = {
                type: 'Utilities',
                amount: 2450,
                date: new Date().toISOString().split('T')[0],
                note: 'Shop Electricity Bill'
            };

            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expensePayload)
            });

            assert.strictEqual(res.status, 201);
            const expense = await res.json();
            assert.ok(expense.id);
            assert.strictEqual(expense.amount, 2450);
            createdExpenseId = expense.id;

            const listRes = await fetch(`${API_URL}/expenses`);
            assert.strictEqual(listRes.status, 200);
            const expenses = await listRes.json();
            assert.ok(expenses.some(e => e.id === createdExpenseId));
        });

        // 13. Reports API (Summary)
        await test('13. Sales Reports Summary Analytics Endpoint', async () => {
            const res = await fetch(`${API_URL}/reports/summary`);
            assert.strictEqual(res.status, 200);
            const report = await res.json();
            assert.ok(report !== undefined);
            assert.ok('totalSales' in report);
            assert.ok('billsCount' in report);
        });

        // 14. Validation Error Boundary (Empty Product Rejection)
        await test('14. Validation Error Boundary (Empty Product Rejection)', async () => {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            assert.strictEqual(res.status, 400);
        });

        // 15. Item-Level Discount and Tax Persistence in Bill
        await test('15. Item-Level Discount and GST Tax Calculation in Bill', async () => {
            const multiItemBill = {
                customerName: 'Sita Raman',
                customerMobile: '9443212345',
                items: [
                    {
                        name: 'Silk Saree with 10% Disc',
                        qty: 1,
                        sellingPrice: 5000,
                        discountPercent: 10,
                        discountAmount: 500,
                        taxPercent: 5,
                        taxAmount: 225,
                        total: 4725
                    },
                    {
                        name: 'Dhoti Set with 0% Disc',
                        qty: 2,
                        sellingPrice: 1000,
                        discountPercent: 0,
                        discountAmount: 0,
                        taxPercent: 5,
                        taxAmount: 100,
                        total: 2100
                    }
                ],
                subtotal: 7000,
                discountAmount: 500,
                gstAmount: 325,
                grandTotal: 6825,
                paymentMethod: 'UPI / GPay'
            };

            const res = await fetch(`${API_URL}/bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(multiItemBill)
            });

            assert.strictEqual(res.status, 201);
            const saved = await res.json();
            assert.ok(saved.id);
            createdBillId = saved.id;
            assert.strictEqual(saved.grandTotal, 6825);
            assert.strictEqual(saved.items.length, 2);
            assert.strictEqual(saved.items[0].discountPercent, 10);
            assert.strictEqual(saved.items[0].taxPercent, 5);
        });

        // 16. Store Settings Persistence (GET & PATCH)
        await test('16. Store Settings GET and PATCH Configuration', async () => {
            const patchRes = await fetch(`${API_URL}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopName: 'DURGAS (TEST)',
                    taxRate: 5
                })
            });
            assert.strictEqual(patchRes.status, 200);

            const getRes = await fetch(`${API_URL}/settings`);
            assert.strictEqual(getRes.status, 200);
            const current = await getRes.json();
            assert.strictEqual(current.shopName, 'DURGAS (TEST)');
            assert.strictEqual(current.taxRate, 5);
        });

        // 17. Alteration / Tailoring Job Workflow
        await test('17. Alteration Job Logging and Status Tracking', async () => {
            const jobPayload = {
                customer: 'Lakshmi Ammal',
                mobile: '9840112233',
                items: 'Bridal Kanchipuram Saree',
                services: ['Fall & Pico', 'Zari Tassels'],
                deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                amount: 350,
                status: 'In Progress'
            };

            const res = await fetch(`${API_URL}/alterations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobPayload)
            });

            assert.strictEqual(res.status, 201);
            const createdJob = await res.json();
            assert.ok(createdJob.id);
            createdAlterationId = createdJob.id;
            assert.strictEqual(createdJob.amount, 350);

            const listRes = await fetch(`${API_URL}/alterations`);
            assert.strictEqual(listRes.status, 200);
            const list = await listRes.json();
            assert.ok(list.some(j => j.id === createdJob.id));
        });

        // 18. Returns and Stock Restoration Workflow
        await test('18. Product Return with Automatic Stock Restoration', async () => {
            // Check current stock of test product
            const prodRes = await fetch(`${API_URL}/products/${createdProductId}`);
            assert.strictEqual(prodRes.status, 200);
            const prodBefore = await prodRes.json();
            const stockBefore = prodBefore.stockQty;

            // Submit a return for 2 units
            const returnPayload = {
                billNo: 'INV-TEST-RET',
                customerName: 'Ananya S',
                items: [
                    {
                        productId: createdProductId,
                        name: prodBefore.name,
                        qty: 2,
                        sellingPrice: prodBefore.sellingPrice
                    }
                ],
                refundAmount: prodBefore.sellingPrice * 2,
                reason: 'Color exchange requested'
            };

            const retRes = await fetch(`${API_URL}/returns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(returnPayload)
            });

            assert.strictEqual(retRes.status, 201);
            const createdReturn = await retRes.json();
            if (createdReturn && createdReturn.id) createdReturnId = createdReturn.id;

            // Verify stock restored
            const prodAfterRes = await fetch(`${API_URL}/products/${createdProductId}`);
            const prodAfter = await prodAfterRes.json();
            assert.strictEqual(prodAfter.stockQty, stockBefore + 2, 'Stock should increase by returned quantity 2');
        });

        // 19. Unauthorized Token Access Boundary
        await test('19. Unauthorized / Bad Token Rejection Boundary', async () => {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': 'Bearer totally-fake-forged-token-abc' }
            });
            assert.strictEqual(res.status, 401, 'Should return HTTP 401 Unauthorized');
        });

        // 20. CSV Bulk Product Import with Optional Stock & Leading-Zero Barcodes
        let importedBarcode1 = `0007891${Date.now().toString().slice(-4)}`;
        let importedBarcode2 = `SK-AUTO-${Date.now().toString().slice(-4)}`;
        await test('20. CSV Bulk Import: Optional Stock & Exact String Barcode', async () => {
            const importPayload = {
                products: [
                    {
                        name: 'Imported Silk Saree 1',
                        barcode: importedBarcode1, // Test exact string with leading zero
                        sellingPrice: 1999
                        // stockQty omitted -> should default to 1
                    },
                    {
                        name: 'Imported Cotton Saree 2',
                        barcode: importedBarcode2,
                        sellingPrice: 850,
                        stockQty: 5
                    }
                ]
            };

            const res = await fetch(`${API_URL}/products/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importPayload)
            });

            assert.strictEqual(res.status, 200, 'Import should succeed with HTTP 200');
            const data = await res.json();
            assert.ok(data.message.includes('Import successful'), 'Message should indicate success');

            // Verify item 1 in database
            const allRes = await fetch(`${API_URL}/products`);
            const allProducts = await allRes.json();
            
            const p1 = allProducts.find(p => p.barcode === importedBarcode1);
            assert.ok(p1, 'Product 1 should exist with exact leading-zero barcode');
            assert.strictEqual(p1.barcode, importedBarcode1, 'Barcode must not lose leading zero');
            assert.strictEqual(p1.stockQty, 1, 'Missing stock should default to 1');
            assert.strictEqual(p1.status, 'available', 'Status should be available when stock = 1');

            const p2 = allProducts.find(p => p.barcode === importedBarcode2);
            assert.ok(p2, 'Product 2 should exist');
            assert.strictEqual(p2.stockQty, 5, 'Provided stock should be set to 5');
        });

        // 21. CSV Bulk Import Idempotent Upsert (Update existing product)
        await test('21. CSV Bulk Import Upsert: Updates existing product without duplicate', async () => {
            const updatePayload = {
                products: [
                    {
                        name: 'Imported Silk Saree 1 - Updated Name',
                        barcode: importedBarcode1,
                        sellingPrice: 2499,
                        stockQty: 10
                    }
                ]
            };

            const res = await fetch(`${API_URL}/products/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.message.includes('Updated 1'), 'Should record 1 updated product');

            // Query by barcode to ensure single record and updated values
            const allRes = await fetch(`${API_URL}/products`);
            const allProducts = await allRes.json();
            const matching = allProducts.filter(p => p.barcode === importedBarcode1);
            assert.strictEqual(matching.length, 1, 'Should NOT create duplicate record on existing barcode');
            assert.strictEqual(matching[0].name, 'Imported Silk Saree 1 - Updated Name');
            assert.strictEqual(matching[0].sellingPrice, 2499);
            assert.strictEqual(matching[0].stockQty, 10);
        });

        // 22. CSV Bulk Import Error Handling (Empty Payload)
        await test('22. CSV Bulk Import Error Handling: Reject empty products list', async () => {
            const res = await fetch(`${API_URL}/products/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: [] })
            });
            assert.strictEqual(res.status, 400, 'Empty product list should return HTTP 400');
        });

        // 23. Clean Database Cleanup
        await test('23. Cleanup All Test Records from SQLite Database', async () => {
            if (createdBillId) {
                await fetch(`${API_URL}/bills/${createdBillId}`, { method: 'DELETE' }).catch(() => {});
            }
            if (createdProductId) {
                await fetch(`${API_URL}/products/${createdProductId}`, { method: 'DELETE' }).catch(() => {});
            }
            // Cleanup CSV imported products
            const prodsRes = await fetch(`${API_URL}/products`).catch(() => null);
            if (prodsRes) {
                const prods = await prodsRes.json().catch(() => []);
                for (const p of prods) {
                    if (p.barcode === importedBarcode1 || p.barcode === importedBarcode2) {
                        await fetch(`${API_URL}/products/${p.id}`, { method: 'DELETE' }).catch(() => {});
                    }
                }
            }
            if (createdCustomerId) {
                await fetch(`${API_URL}/customers/${createdCustomerId}`, { method: 'DELETE' }).catch(() => {});
            }
            if (createdExpenseId) {
                await fetch(`${API_URL}/expenses/${createdExpenseId}`, { method: 'DELETE' }).catch(() => {});
            }
            if (createdReturnId) {
                await fetch(`${API_URL}/returns/${createdReturnId}`, { method: 'DELETE' }).catch(() => {});
            }
            if (createdAlterationId) {
                await fetch(`${API_URL}/alterations/${createdAlterationId}`, { method: 'DELETE' }).catch(() => {});
            }
            // Restore official Durgas settings
            await fetch(`${API_URL}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopName: 'DURGAS',
                    shopNameTamil: 'துர்காஸ்',
                    tagline: 'CLOTHING FOR EVERYONE IS AVAILABLE HERE',
                    slogan: 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES',
                    since: 'SINCE 2026',
                    address1: 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street',
                    address2: 'Kanchipuram - 631 501',
                    addressTamil: 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.',
                    phone: '044 46621728, 89251 55521, 89251 55526',
                    email: 'durgaspos@gmail.com',
                    gstNo: '33BWZPN2210D1ZO',
                    taxRate: 5
                })
            }).catch(() => {});
        });

    } catch (err) {
        console.error(`${colors.red}Fatal test runner error:${colors.reset}`, err);
    } finally {
        testServer.close();
        console.log(`\n${colors.bold}------------------------------------------------------${colors.reset}`);
        console.log(`Results: ${colors.green}${passedCount} Passed${colors.reset}, ${failedCount > 0 ? colors.red : colors.green}${failedCount} Failed${colors.reset}`);
        console.log(`${colors.bold}------------------------------------------------------${colors.reset}\n`);

        if (failedCount > 0) {
            process.exit(1);
        }
    }
}

runTests();
