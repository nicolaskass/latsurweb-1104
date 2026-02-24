const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const ALLOWED_FOLDERS = ['hero', 'team', 'trabajos'];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.params.folder;
        if (!ALLOWED_FOLDERS.includes(folder)) return cb(new Error('Carpeta no permitida'));
        const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
        const dir = path.join(DATA_DIR, 'uploads', folder);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = path.basename(file.originalname, ext)
            .replace(/[^a-z0-9]/gi, '-').toLowerCase();
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        ALLOWED_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipo de archivo no permitido'));
    }
});

// POST /api/upload/:folder
router.post('/upload/:folder', verifyToken, (req, res) => {
    if (!ALLOWED_FOLDERS.includes(req.params.folder)) {
        return res.status(400).json({ error: 'Carpeta no permitida' });
    }

    upload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

        // Relative URL stored in content.json (served by both admin and main nginx)
        const url = `/uploads/${req.params.folder}/${req.file.filename}`;

        // Build absolute preview URL using Traefik-forwarded headers
        const proto = req.get('x-forwarded-proto') || req.protocol;
        const host = req.get('x-forwarded-host') || req.get('host');
        const previewUrl = `${proto}://${host}${url}`;

        res.json({ url, previewUrl, filename: req.file.filename });
    });
});

module.exports = router;
