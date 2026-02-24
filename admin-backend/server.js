const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Create upload directories
['hero', 'team', 'trabajos'].forEach(folder => {
    const dir = path.join(UPLOADS_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Seed content.json from default if it doesn't exist in data dir
if (!fs.existsSync(CONTENT_FILE)) {
    const defaultContent = path.join(__dirname, 'data', 'content.json');
    if (fs.existsSync(defaultContent) && defaultContent !== CONTENT_FILE) {
        fs.copyFileSync(defaultContent, CONTENT_FILE);
    }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve admin panel SPA
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/content'));
app.use('/api', require('./routes/upload'));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Latitud Sur Admin running on port ${PORT}`);
});

module.exports = { CONTENT_FILE, UPLOADS_DIR };
