const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const verifyToken = require('../middleware/auth');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GET /api/auth/config
router.get('/config', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'GOOGLE_CLIENT_ID no configurado' });
    }
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// POST /api/auth/google — exchange Google ID token for our JWT
router.post('/google', async (req, res) => {
    const { credential } = req.body;

    if (!credential) return res.status(400).json({ error: 'Token de Google requerido' });
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'El servidor no está configurado correctamente' });
    }

    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({ error: 'Token de Google inválido' });
    }

    const email = payload.email.toLowerCase();
    const allowedEmails = (process.env.ALLOWED_EMAILS || '')
        .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

    if (!allowedEmails.includes(email)) {
        return res.status(403).json({ error: 'Esta cuenta no tiene acceso al panel' });
    }

    const token = jwt.sign(
        { email, name: payload.name, picture: payload.picture, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({ token, email, name: payload.name, picture: payload.picture });
});

// GET /api/auth/verify
router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

module.exports = router;
