// admin.js – Middleware-Router entfernt, stattdessen statisches Frontend per React

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Stelle die React-Admin-App bereit (z. B. unter /admin-app)
router.use('/', express.static(path.join(__dirname, 'admin-app', 'build')));

// Fallback für SPA-Routing
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-app', 'build', 'index.html'));
});

module.exports = router;