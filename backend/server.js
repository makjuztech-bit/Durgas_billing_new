const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database');

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Require all models so SQLite creates all tables
const Bill = require('./models/Bill');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Staff = require('./models/Staff');
const Supplier = require('./models/Supplier');
const Expense = require('./models/Expense');
const Settings = require('./models/Settings');
const Adjustment = require('./models/Adjustment');
const Purchase = require('./models/Purchase');
const Return = require('./models/Return');
const Order = require('./models/Order');
const Alteration = require('./models/Alteration');
const User = require('./models/User');

// Database Connection & Auto Sync
sequelize.sync().then(() => {
    console.log('SQLite Database Connected and Synced');
}).catch(err => {
    console.error('SQLite connection error:', err);
});

// Routes
const billRoutes = require('./routes/billRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const staffRoutes = require('./routes/staffRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adjustmentRoutes = require('./routes/adjustmentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const returnRoutes = require('./routes/returnRoutes');
const orderRoutes = require('./routes/orderRoutes');
const alterationRoutes = require('./routes/alterationRoutes');

app.use('/api/bills', billRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sarees', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alterations', alterationRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Health Check & DB connection endpoint
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', database: 'sqlite connected' });
    } catch (err) {
        res.status(500).json({ status: 'error', database: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Durgas Billing API is running (Sequelize + SQLite Standalone)');
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Internal Database/Server Error'
    });
});

// Dynamic port finder & 127.0.0.1 binding (Windows conflict safe)
function startServer(targetPort, retryCount = 0) {
    const server = http.createServer(app);

    server.listen(targetPort, '127.0.0.1', () => {
        const port = server.address().port;
        console.log(`\x1b[36m[BACKEND]\x1b[0m Server running on port ${port} (http://127.0.0.1:${port})`);
        
        // Write active port info for Vite proxy and Electron
        try {
            const portInfo = JSON.stringify({ port, apiUrl: `http://127.0.0.1:${port}/api` }, null, 2);
            fs.writeFileSync(path.join(__dirname, 'active_port.json'), portInfo);
        } catch (e) {
            if (e.code !== 'EROFS') {
                console.warn('Could not write active_port.json:', e.message);
            }
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (retryCount > 10) {
                console.warn(`[BACKEND] Multiple ports in use. Binding to any available OS port (port 0)...`);
                startServer(0, 0); // Port 0 asks OS to assign any free port
            } else {
                console.warn(`[BACKEND] Port ${targetPort} is occupied, automatically trying port ${targetPort + 1}...`);
                startServer(targetPort + 1, retryCount + 1);
            }
        } else {
            console.error('[BACKEND] Server error:', err);
        }
    });
    return server;
}

if (require.main === module) {
    startServer(DEFAULT_PORT);
}

module.exports = { app, startServer };
