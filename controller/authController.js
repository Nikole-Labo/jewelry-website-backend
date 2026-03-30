import userModel from '../models/user.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

function sqlErrorNumber(err) {
    return err?.number ?? err?.originalError?.number;
}

export async function register(req, res) {
    const { email, username, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const emailTrim = String(email).trim();
    const displayName =
        (username && String(username).trim()) || emailTrim.split('@')[0] || 'member';

    try {
        const existingUser = await userModel.findByEmail(emailTrim);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const newUser = await userModel.createUser(emailTrim, displayName, password, 1);
        res.status(201).json({ message: 'User created', userId: newUser.id });
    } catch (err) {
        console.error('Register error:', err);
        const num = sqlErrorNumber(err);
        if (num === 2627 || num === 2601) {
            return res.status(409).json({ error: 'Email or username already taken' });
        }
        const devHint =
            process.env.NODE_ENV !== 'production'
                ? err?.originalError?.message || err?.message
                : undefined;
        res.status(500).json({
            error: 'Internal server error',
            ...(devHint ? { hint: devHint } : {}),
        });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
    }

    try {
        const user = await userModel.findByEmail(String(email).trim());
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const stored = user.password ?? user.passwordHash;
        if (!stored || password !== stored) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: Number(user.id), roleId: Number(user.roleId) },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({
            token,
            roleId: user.roleId,
            userId: user.id,
            email: user.email,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
