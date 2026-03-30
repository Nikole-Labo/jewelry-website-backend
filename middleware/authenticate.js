
import jwt from 'jsonwebtoken';
import { ROLE_ADMIN } from '../constants/roles.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Missing or invalid Authorization header.',
            hint: 'Sign in again; your session may have expired.',
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn('[auth] JWT verify failed:', err.message);
            return res.status(403).json({
                error: 'Invalid or expired session.',
                hint: 'Sign out and sign in again.',
            });
        }
        req.user = user;
        next();
    });
}

export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Not authenticated.',
                hint: 'Sign in again.',
            });
        }
        const userRoleId = Number(req.user.roleId);
        if (!allowedRoles.includes(userRoleId)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

export function rejectAdminUsers(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Not authenticated.',
            hint: 'Sign in again.',
        });
    }
    if (Number(req.user.roleId) === ROLE_ADMIN) {
        return res.status(403).json({
            error: 'This feature is for members only.',
            hint: 'Administrator accounts use Manage catalog and Categories.',
        });
    }
    next();
}

export default { authenticateToken };
