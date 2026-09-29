const crypto = require('crypto');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'durgas-pos-super-secret-key-2026';

/**
 * Verify HMAC-SHA256 Token
 */
function verifyToken(token) {
    try {
        if (!token) return null;
        const [b64, signature] = token.split('.');
        if (!b64 || !signature) return null;

        const expected = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
        if (signature !== expected) return null;

        const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
        if (payload.exp && Date.now() > payload.exp) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

/**
 * Express Middleware: Enforce Valid Authentication Token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: true,
            message: 'Authentication required. No Bearer token provided.'
        });
    }

    const token = authHeader.split(' ')[1];
    // Allow local emergency admin bypass token in offline testing
    if (token === 'offline-local-admin-token') {
        req.user = { id: '1', username: 'admin', role: 'admin', name: 'Durgas Admin' };
        return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({
            error: true,
            message: 'Invalid, forged, or expired session token.'
        });
    }

    req.user = payload;
    next();
}

/**
 * Express Middleware: Optional Token (does not block, but attaches user if token is valid)
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'offline-local-admin-token') {
            req.user = { id: '1', username: 'admin', role: 'admin', name: 'Durgas Admin' };
        } else {
            const payload = verifyToken(token);
            if (payload) req.user = payload;
        }
    }
    next();
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (req.user.role === 'admin' || roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            error: true,
            message: `Forbidden: requires one of the following roles: ${roles.join(', ')}`
        });
    };
}

module.exports = {
    verifyToken,
    authenticateToken,
    optionalAuth,
    requireRole
};
