const express = require('express');
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

function readContent() {
    if (!fs.existsSync(CONTENT_FILE)) {
        const defaultFile = path.join(__dirname, '..', 'data', 'content.json');
        if (fs.existsSync(defaultFile)) return JSON.parse(fs.readFileSync(defaultFile, 'utf8'));
        return {};
    }
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

function writeContent(data) {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(arr) {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(i => i.id || 0)) + 1;
}

// ── Public endpoint (no auth) ────────────────────────────────────────────────
router.get('/public/content', (req, res) => {
    try {
        res.json(readContent());
    } catch (err) {
        res.status(500).json({ error: 'Error al leer contenido' });
    }
});

// ── Object sections (GET + PUT the whole object) ─────────────────────────────
function objectRoutes(section) {
    router.get(`/content/${section}`, verifyToken, (req, res) => {
        res.json(readContent()[section] || {});
    });
    router.put(`/content/${section}`, verifyToken, (req, res) => {
        const content = readContent();
        content[section] = { ...(content[section] || {}), ...req.body };
        writeContent(content);
        res.json(content[section]);
    });
}

// ── Array sections (full CRUD) ────────────────────────────────────────────────
function crudRoutes(section) {
    router.get(`/content/${section}`, verifyToken, (req, res) => {
        res.json(readContent()[section] || []);
    });
    router.post(`/content/${section}`, verifyToken, (req, res) => {
        const content = readContent();
        if (!content[section]) content[section] = [];
        const item = { id: nextId(content[section]), ...req.body };
        content[section].push(item);
        writeContent(content);
        res.status(201).json(item);
    });
    router.put(`/content/${section}/:id`, verifyToken, (req, res) => {
        const content = readContent();
        const idx = (content[section] || []).findIndex(i => i.id === parseInt(req.params.id));
        if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
        content[section][idx] = { ...content[section][idx], ...req.body, id: parseInt(req.params.id) };
        writeContent(content);
        res.json(content[section][idx]);
    });
    router.delete(`/content/${section}/:id`, verifyToken, (req, res) => {
        const content = readContent();
        const before = (content[section] || []).length;
        content[section] = (content[section] || []).filter(i => i.id !== parseInt(req.params.id));
        if (content[section].length === before) return res.status(404).json({ error: 'No encontrado' });
        writeContent(content);
        res.json({ success: true });
    });
}

// ── Nested array helpers (slides inside hero, team/badges inside objects) ─────
function nestedArrayRoutes(section, subKey) {
    const base = `/content/${section}/${subKey}`;

    router.get(base, verifyToken, (req, res) => {
        const parent = readContent()[section] || {};
        res.json(parent[subKey] || []);
    });
    router.post(base, verifyToken, (req, res) => {
        const content = readContent();
        if (!content[section]) content[section] = {};
        if (!content[section][subKey]) content[section][subKey] = [];
        const item = { id: nextId(content[section][subKey]), ...req.body };
        content[section][subKey].push(item);
        writeContent(content);
        res.status(201).json(item);
    });
    router.put(`${base}/:id`, verifyToken, (req, res) => {
        const content = readContent();
        const arr = (content[section] || {})[subKey] || [];
        const idx = arr.findIndex(i => i.id === parseInt(req.params.id));
        if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
        arr[idx] = { ...arr[idx], ...req.body, id: parseInt(req.params.id) };
        content[section][subKey] = arr;
        writeContent(content);
        res.json(arr[idx]);
    });
    router.delete(`${base}/:id`, verifyToken, (req, res) => {
        const content = readContent();
        const arr = (content[section] || {})[subKey] || [];
        const before = arr.length;
        content[section][subKey] = arr.filter(i => i.id !== parseInt(req.params.id));
        if (content[section][subKey].length === before) return res.status(404).json({ error: 'No encontrado' });
        writeContent(content);
        res.json({ success: true });
    });
}

// ── Register routes ───────────────────────────────────────────────────────────
objectRoutes('site');
objectRoutes('hero');
objectRoutes('nosotros');
objectRoutes('contacto');

crudRoutes('servicios');
crudRoutes('trabajos');

nestedArrayRoutes('hero', 'slides');
nestedArrayRoutes('nosotros', 'team');
nestedArrayRoutes('contacto', 'badges');

module.exports = router;
