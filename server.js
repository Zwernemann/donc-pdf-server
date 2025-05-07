// server.js

const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const multer = require('multer');
const handlebars = require('handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const adminRoutes = require('./admin');
app.use('/admin', adminRoutes);

// Compile the Handlebars template once on server start
const templateHtml = fs.readFileSync(path.join(__dirname, 'template', 'donc-template.html'), 'utf8');
const compileTemplate = handlebars.compile(templateHtml);

// Determine if we're on Windows
const isWindows = process.platform === 'win32';

// PDF generation route
app.post('/generate-donc', async (req, res) => {
  try {
    const data = req.body;
    const html = compileTemplate(data);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="donc-form.pdf"'
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Upload API for template ZIP files
const upload = multer({ dest: 'tmp/' });
const TEMPLATE_ROOT = path.join(__dirname, 'templates');

app.post('/api/upload-template', upload.single('templateZip'), async (req, res) => {
  const file = req.file;
  const templateName = req.body.templateName;

  if (!file || !templateName) {
    return res.status(400).json({ error: 'templateZip and templateName required' });
  }

  const extractPath = path.join(TEMPLATE_ROOT, templateName);

  try {
    await fsExtra.ensureDir(extractPath);
    await fsExtra.move(file.path, path.join(extractPath, file.originalname), { overwrite: true });
    res.status(200).json({ status: 'uploaded', path: `/templates/${templateName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Template-Browser API
app.get('/api/templates', async (req, res) => {
  try {
    const dirs = await fs.promises.readdir(TEMPLATE_ROOT, { withFileTypes: true });
    const folders = dirs.filter(d => d.isDirectory()).map(d => d.name);
    res.json(folders);
  } catch (err) {
    console.error('Fehler beim Lesen des Templates-Verzeichnisses:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Template-Liste' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`PDF generation server running on port ${PORT}`);
});
