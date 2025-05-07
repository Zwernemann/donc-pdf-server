// admin.js – einfache Admin-Oberfläche für das PDF-Report-System

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const templatesPath = path.join(__dirname, 'templates');
const upload = multer({ dest: path.join(__dirname, 'tmp-uploads') });

// Liste aller Templates anzeigen
router.get('/', (req, res) => {
  const templates = fs.readdirSync(templatesPath).filter(f => {
    const stat = fs.statSync(path.join(templatesPath, f));
    return stat.isDirectory();
  });

  const listItems = templates.map(t => `<li><a href="/admin/test/${t}">${t}</a></li>`).join('');
  res.send(`<h1>Available Templates</h1><ul>${listItems}</ul><hr><a href="/admin/upload">Upload New Template</a>`);
});

// Upload-Formular anzeigen
router.get('/upload', (req, res) => {
  res.send(`
    <h1>Upload Template (ZIP, HTML+CSS)</h1>
    <form action="/admin/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="template" accept=".zip" required />
      <button type="submit">Upload</button>
    </form>
    <p><a href="/admin">Zurück zur Übersicht</a></p>
  `);
});

// Upload empfangen (ZIP noch nicht entpackt – Platzhalter)
router.post('/upload', upload.single('template'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  // TODO: ZIP entpacken und in /templates/{name} speichern
  res.send(`Upload empfangen: ${file.originalname}<br><a href="/admin">Zurück</a>`);
});

// Testseite für ein Template
router.get('/test/:template', (req, res) => {
  const template = req.params.template;
  const exampleJsonPath = path.join(templatesPath, template, 'example.json');
  let exampleJson = '{}';

  if (fs.existsSync(exampleJsonPath)) {
    exampleJson = fs.readFileSync(exampleJsonPath, 'utf-8');
  }

  res.send(`
    <h1>Test Template: ${template}</h1>
    <form method="post" action="/generate/${template}" target="_blank">
      <textarea name="json" rows="20" cols="80">${exampleJson}</textarea><br>
      <button type="submit">Generate PDF</button>
    </form>
    <p><a href="/admin">Zurück</a></p>
  `);
});

module.exports = router;
