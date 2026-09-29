const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Memory storage for file upload (we need buffer)
const upload = multer({ storage: multer.memoryStorage() });

const APP_NAME = 'SilkStorePro';
const VERSION = '1.0';

// --- HELPERS ---

const generateMetadata = (moduleName) => {
    return [
        ['System', APP_NAME],
        ['Version', VERSION],
        ['Module', moduleName],
        ['Exported At', new Date().toISOString()],
        ['Instructions', 'Do not modify the "Metadata" sheet. Edit data in the "Data" sheet. Do not change column headers.'],
    ];
};

const validateMetadata = (wb) => {
    const metaSheet = wb.Sheets['Metadata'];
    if (!metaSheet) return { valid: false, error: 'Missing "Metadata" sheet' };

    const metaData = xlsx.utils.sheet_to_json(metaSheet, { header: 1 });
    const appNameRow = metaData.find(row => row[0] === 'System');
    const moduleRow = metaData.find(row => row[0] === 'Module');

    if (!appNameRow || appNameRow[1] !== APP_NAME) return { valid: false, error: 'Invalid System Name' };

    return { valid: true, module: moduleRow ? moduleRow[1] : null };
};

// --- EXPORT ROUTES ---

router.get('/template/:module', (req, res) => {
    try {
        const { module } = req.params;
        const wb = xlsx.utils.book_new();

        // Metadata Sheet
        const wsMeta = xlsx.utils.aoa_to_sheet(generateMetadata(module));
        xlsx.utils.book_append_sheet(wb, wsMeta, "Metadata");

        // Data Sheet with Headers
        let headers = [];
        if (module === 'Products') {
            headers = [['productCode', 'barcode', 'name', 'category', 'department', 'purchasePrice', 'sellingPrice', 'mrp', 'stockQty', 'rackLocation', 'status']];
        } else if (module === 'Customers') {
            headers = [['name', 'mobile', 'place', 'type']];
        } else {
            return res.status(400).json({ message: 'Unknown module' });
        }

        const wsData = xlsx.utils.aoa_to_sheet(headers);
        xlsx.utils.book_append_sheet(wb, wsData, "Data");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=${module}_Template.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/export/:module', async (req, res) => {
    try {
        const { module } = req.params;
        const wb = xlsx.utils.book_new();

        // Metadata
        const wsMeta = xlsx.utils.aoa_to_sheet(generateMetadata(module));
        xlsx.utils.book_append_sheet(wb, wsMeta, "Metadata");

        // Fetch Data
        let data = [];
        let headers = [];

        if (module === 'Products') {
            const products = await Product.find({}).lean();
            // Flatten/Format for Excel
            data = products.map(p => ({
                id: p._id.toString(), // Keep ID for updates
                productCode: p.productCode || '',
                barcode: p.barcode || '',
                name: p.name || '',
                category: p.category || '',
                department: p.department || 'Saree',
                purchasePrice: p.purchasePrice || 0,
                sellingPrice: p.sellingPrice || 0,
                mrp: p.mrp || 0,
                stockQty: p.stockQty || 0,
                rackLocation: p.rackLocation || '',
                status: p.status || 'available'
            }));

        } else if (module === 'Customers') {
            const customers = await Customer.find({}).lean();
            data = customers.map(c => ({
                id: c._id.toString(),
                name: c.name || '',
                mobile: c.mobile || '',
                place: c.place || '',
                type: c.type || 'Retail'
            }));
        } else {
            return res.status(400).json({ message: 'Unknown module for export' });
        }

        const wsData = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, wsData, "Data");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=${module}_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- IMPORT ROUTES ---

router.post('/import', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });

        // 1. Validate Metadata
        const { valid, module, error } = validateMetadata(wb);
        if (!valid) return res.status(400).json({ message: `Validation Failed: ${error}` });

        if (!wb.Sheets['Data']) return res.status(400).json({ message: 'Missing "Data" sheet' });

        // 2. Process Data
        const rows = xlsx.utils.sheet_to_json(wb.Sheets['Data']);
        if (rows.length === 0) return res.json({ message: 'No records found to import' });

        const results = {
            module,
            total: rows.length,
            updated: 0,
            inserted: 0,
            failed: 0,
            errors: []
        };

        if (module === 'Products') {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                try {
                    // Validation
                    if (!row.productCode || !row.barcode || !row.name) {
                        throw new Error(`Row ${i + 2}: Missing required fields (Code/Barcode/Name)`);
                    }

                    // Key for match: ID (if exists) OR Barcode
                    let product;
                    if (row.id) {
                        product = await Product.findById(row.id);
                    }
                    if (!product) {
                        product = await Product.findOne({ barcode: row.barcode });
                    }

                    if (product) {
                        // Update
                        Object.assign(product, row);
                        await product.save();
                        results.updated++;
                    } else {
                        // Insert
                        // Remove 'id' if present to avoid casting error
                        delete row.id;
                        await Product.create(row);
                        results.inserted++;
                    }
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Row ${i + 2}: ${err.message}`);
                }
            }
        } else if (module === 'Customers') {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                try {
                    if (!row.mobile || !row.name) {
                        throw new Error(`Row ${i + 2}: Missing Name or Mobile`);
                    }

                    // Normalize mobile
                    row.mobile = String(row.mobile);

                    let customer;
                    if (row.id) {
                        customer = await Customer.findById(row.id);
                    }
                    if (!customer) {
                        customer = await Customer.findOne({ mobile: row.mobile });
                    }

                    if (customer) {
                        Object.assign(customer, row);
                        await customer.save();
                        results.updated++;
                    } else {
                        delete row.id;
                        await Customer.create(row);
                        results.inserted++;
                    }
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Row ${i + 2}: ${err.message}`);
                }
            }
        } else {
            return res.status(400).json({ message: `Unknown module: ${module}` });
        }

        res.json({ message: 'Import completed', results });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
