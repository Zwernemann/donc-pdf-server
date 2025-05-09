// server.js – Multi-Template-Engine PDF Renderer

const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const multer = require('multer');
const handlebars = require('handlebars');
const nunjucks = require('nunjucks');
const { Liquid } = require('liquidjs');
const AdmZip = require('adm-zip');
const mime = require('mime-types');

const app = express();
const upload = multer({ dest: 'tmp/' });
const PORT = process.env.PORT || 3000;
const TEMPLATE_ROOT = path.join(__dirname, 'templates');

// Nunjucks-Konfiguration (für .njk Templates)
nunjucks.configure({ autoescape: true, noCache: true });

// LiquidJS-Konfiguration (für .liquid Templates)
const liquidEngine = new Liquid({ root: TEMPLATE_ROOT, extname: '.liquid' });

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Template-Engine basierend auf Dateiendung bestimmen
function getTemplateEngineByExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.hbs' || ext === '.handlebars') return 'handlebars';
  if (ext === '.njk' || ext === '.nunjucks') return 'nunjucks';
  if (ext === '.liquid') return 'liquid';
  return null;
}

// Fonts als @font-face Style mit Base64 einbetten
async function embedFontsAsBase64() {
  const fontsDir = path.join(__dirname, 'fonts');
  let fontFiles = [];
  try {
    fontFiles = (await fs.promises.readdir(fontsDir)).filter(f => f.match(/\.(ttf|woff2?|otf)$/i));
  } catch {
    return '';
  }
  if (fontFiles.length === 0) return '';
  const styles = await Promise.all(fontFiles.map(async filename => {
    const fullPath = path.join(fontsDir, filename);
    const fontData = await fs.promises.readFile(fullPath);
    const base64 = fontData.toString('base64');
    const mimeType = mime.lookup(fullPath) || 'font/ttf';
    const fontName = path.parse(filename).name;
    return `@font-face { font-family: '${fontName}'; src: url(data:${mimeType};base64,${base64}); }`;
  }));
  return `<style>\n${styles.join('\n')}\n</style>`;
}

// Images im Template als Base64 einbetten
async function embedImagesAsBase64(html, dirPath) {
  return html.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    try {
      const imgPath = path.join(dirPath, src);
      if (!fs.existsSync(imgPath)) return match;
      const mimeType = mime.lookup(imgPath) || 'application/octet-stream';
      const base64 = fs.readFileSync(imgPath).toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return match.replace(src, dataUri);
    } catch {
      return match;
    }
  });
}

// PDF-Generierung basierend auf Template + Engine
app.post('/generate/:templateName', async (req, res) => {
  const { templateName } = req.params;
  const data = req.body;
  const dirPath = path.join(TEMPLATE_ROOT, templateName);

  try {
    const files = await fs.promises.readdir(dirPath);
    const supportedExtensions = ['.hbs', '.handlebars', '.njk', '.nunjucks', '.liquid'];
    const htmlFile = files.find(f => supportedExtensions.includes(path.extname(f).toLowerCase()));
    if (!htmlFile) return res.status(404).send('No supported template file found');

    const engine = getTemplateEngineByExtension(htmlFile);
    const templateHtml = fs.readFileSync(path.join(dirPath, htmlFile), 'utf8');
    const embeddedFontFace = await embedFontsAsBase64();

    // Template rendern je nach Engine
    let html;
    if (engine === 'handlebars') {
      const compile = handlebars.compile(templateHtml);
      html = compile({ ...data, embeddedFontFace });
    } else if (engine === 'nunjucks') {
      html = nunjucks.renderString(templateHtml, { ...data, embeddedFontFace });
    } else if (engine === 'liquid') {
      html = await liquidEngine.parseAndRender(templateHtml, { ...data, embeddedFontFace });
    } else {
      return res.status(400).send('Unsupported template engine');
    }

    const htmlWithEmbeddedImages = await embedImagesAsBase64(html, dirPath);

    // PDF mit Puppeteer erzeugen
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlWithEmbeddedImages, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // PDF senden
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

// Template-ZIP Upload & Extraktion
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

// Liste aller Template-Verzeichnisse ausgeben
app.get('/api/templates', async (req, res) => {
  try {
    const dirs = await fs.promises.readdir(TEMPLATE_ROOT, { withFileTypes: true });
    const folders = dirs.filter(d => d.isDirectory()).map(d => d.name);
    res.json(folders);
  } catch (err) {
    console.error('Template listing failed:', err);
    res.status(500).json({ error: 'Template listing failed' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Multi-engine PDF server running on port ${PORT}`);
});
