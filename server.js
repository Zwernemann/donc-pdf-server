// server.js – Multi-Engine PDF Generator (Handlebars, Nunjucks, Liquid)

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
const fontkit = require('fontkit');

const app = express();
const upload = multer({ dest: 'tmp/' });
const PORT = process.env.PORT || 3000;
const TEMPLATE_ROOT = path.join(__dirname, 'templates');

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Admin-Router (nicht entfernen!)
const adminRoutes = require('./admin');
app.use('/admin', adminRoutes);

// Template-Engine Setup
nunjucks.configure({ autoescape: true, noCache: true });
const liquidEngine = new Liquid({ root: TEMPLATE_ROOT, extname: '.liquid' });

// Standard-DONC-Route (Handlebars only)
const doncTemplateHtml = fs.readFileSync(path.join(__dirname, 'template', 'donc-template.html'), 'utf8');
const compileDoncTemplate = handlebars.compile(doncTemplateHtml);

app.post('/generate-donc', async (req, res) => {
  try {
    const data = req.body;
    const html = compileDoncTemplate(data);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="donc-form.pdf"' });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Dynamischer Template-Endpunkt
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
console.log('HTML: ',htmlWithEmbeddedImages.substring(0,1000));
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlWithEmbeddedImages, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${templateName}.pdf"` });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).send('PDF generation failed');
  }
});

// Template-Upload (ZIP) & Entpacken
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

// API: Liste verfügbarer Templates
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

// Image-Einbettung per Base64
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

// Font-Einbettung aus /fonts/ als @font-face
async function embedFontsAsBase64() {
  const fontsDir = path.join(__dirname, 'fonts');

  let fontFiles = [];
  try {
    fontFiles = (await fs.promises.readdir(fontsDir)).filter(f => f.match(/\.(ttf|woff2?|otf)$/i));
  } catch (err) {
    console.warn('Fonts directory not found or unreadable:', fontsDir);
    return '';
  }
  if (fontFiles.length === 0) return '';

  const styles = await Promise.all(fontFiles.map(async filename => {
    const fullPath = path.join(fontsDir, filename);
    const fontData = await fs.promises.readFile(fullPath);
    const base64 = fontData.toString('base64');
    const mimeType = mime.lookup(fullPath) || 'font/ttf';

    // Fontnamen direkt aus Fontdatei ermitteln
    let fontName = path.parse(filename).name;
    try {
      const font = fontkit.openSync(fullPath);
      fontName = font.fullName || fontName;
    } catch (err) {
      console.warn(`Fehler beim Auslesen von ${filename}:`, err.message);
    }

    let formatHint = 'truetype';
    if (mimeType.includes('woff2')) formatHint = 'woff2';
    else if (mimeType.includes('woff')) formatHint = 'woff';
    else if (mimeType.includes('opentype')) formatHint = 'opentype';

    return `@font-face {
      font-family: '${fontName}';
      src: url('data:${mimeType};base64,${base64}') format('${formatHint}');
      font-weight: normal;
      font-style: normal;
    }`;
  }));

  return `<style>\n${styles.join('\n')}\n</style>`;
}


// Engine-Resolver für Templates
function getTemplateEngineByExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.hbs' || ext === '.handlebars') return 'handlebars';
  if (ext === '.njk' || ext === '.nunjucks') return 'nunjucks';
  if (ext === '.liquid') return 'liquid';
  return null;
}

// Serverstart
app.listen(PORT, () => {
  console.log(`PDF2025def generation server running on port ${PORT}`);
});
