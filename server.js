// server.js

const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));

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

// Start the server
app.listen(PORT, () => {
  console.log(`PDF generation server running on port ${PORT}`);
});
