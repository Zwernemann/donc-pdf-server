// server.js

const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const multer = require('multer');
const handlebars = require('handlebars');
const upload = multer({ dest: 'tmp/' }); 
const AdmZip = require('adm-zip');
const mime = require('mime-types'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const adminRoutes = require('./admin');
app.use('/admin', adminRoutes);

// Template-Verzeichnis
const TEMPLATE_ROOT = path.join(__dirname, 'templates');

// PDF generation route (festes Template donc-template.html)
const doncTemplateHtml = fs.readFileSync(path.join(__dirname, 'template', 'donc-template.html'), 'utf8');
const compileDoncTemplate = handlebars.compile(doncTemplateHtml);

app.post('/generate-donc', async (req, res) => {
  try {
    const data = req.body;
    const html = compileDoncTemplate(data);

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

// POST /generate/:templateName → dynamischer PDF-Generator
app.post('/generate/:templateName', async (req, res) => {
  const { templateName } = req.params;
  const data = req.body;
  const dirPath = path.join(TEMPLATE_ROOT, templateName);

  try {
    const files = await fs.promises.readdir(dirPath);
    console.log('Verzeichnisinhalt:', files);

    const htmlFile = files.find(f => f.endsWith('.html'));
    if (!htmlFile) return res.status(404).send('No HTML file found in template directory');

const templateHtml = fs.readFileSync(path.join(dirPath, htmlFile), 'utf8');
const compile = handlebars.compile(templateHtml);
const html = compile(data);

const htmlWithEmbeddedImages = await embedImagesAsBase64(html, dirPath);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setContent(htmlWithEmbeddedImages, { waitUntil: 'networkidle0' });

const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${templateName}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('PDF generation failed');
  }
});



// Upload API for template ZIP files
app.post('/api/upload-template', upload.single('templateZip'), async (req, res) => {
  const file = req.file;
  const templateName = req.body.templateName;

  if (!file || !templateName) {
    return res.status(400).json({ error: 'templateZip and templateName required' });
  }

  const extractPath = path.join(TEMPLATE_ROOT, templateName);

  try {
    await fsExtra.ensureDir(extractPath);
    const zip = new AdmZip(file.path);
    zip.extractAllTo(extractPath, true);
    await fsExtra.remove(file.path);

    res.status(200).json({ status: 'uploaded', path: `/templates/${templateName}` });
  } catch (err) {
    console.error('Upload failed:', err);
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

async function embedImagesAsBase64(html, dirPath) {
  return html.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    try {
      const imgPath = path.join(dirPath, src);
      if (!fs.existsSync(imgPath)) return match;

      const mimeType = mime.lookup(imgPath) || 'application/octet-stream';
      const base64 = fs.readFileSync(imgPath).toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;

      return match.replace(src, dataUri);
    } catch (err) {
      console.error(`Fehler beim Einbetten des Bildes ${src}:`, err);
      return match;
    }
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`PDF generation server running on port ${PORT}`);
});
