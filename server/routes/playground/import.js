const express = require('express');
const router = express.Router();
const JSZip = require('jszip');

// POST /api/playground/import/json
router.post('/json', (req, res) => {
  try {
    const data = typeof req.body?.content === 'string'
      ? JSON.parse(req.body.content)
      : req.body || {};

    res.json({
      html: data.html || '',
      css: data.css || '',
      javascript: data.javascript || '',
      cdn_libraries: data.cdn_libraries || []
    });
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON file' });
  }
});

// POST /api/playground/import/html
router.post('/html', (req, res) => {
  try {
    const htmlStr = typeof req.body?.content === 'string' ? req.body.content : '';
    if (!htmlStr) return res.status(400).json({ error: 'No file uploaded' });
    
    let css = '', js = '', body = htmlStr;

    const styleMatch = htmlStr.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) css = styleMatch[1];

    const scriptMatch = htmlStr.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) js = scriptMatch[1];

    const bodyMatch = htmlStr.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) body = bodyMatch[1];

    res.json({ html: body, css, javascript: js, cdn_libraries: [] });
  } catch (e) {
    res.status(400).json({ error: 'Invalid HTML file' });
  }
});

// POST /api/playground/import/zip
router.post('/zip', async (req, res) => {
  try {
    const content = req.body?.content;
    if (!content) return res.status(400).json({ error: 'No file uploaded' });
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'base64');
    const zip = await JSZip.loadAsync(buffer);
    
    const htmlFile = zip.file('index.html') || zip.file(/\.html$/i)[0];
    const cssFile = zip.file('style.css') || zip.file(/\.css$/i)[0];
    const jsFile = zip.file('script.js') || zip.file(/\.js$/i)[0];

    const htmlRaw = htmlFile ? await htmlFile.async('string') : '';
    const css = cssFile ? await cssFile.async('string') : '';
    const javascript = jsFile ? await jsFile.async('string') : '';

    let body = htmlRaw;
    const bodyMatch = htmlRaw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) body = bodyMatch[1];

    res.json({ html: body, css, javascript, cdn_libraries: [] });
  } catch (e) {
    res.status(400).json({ error: 'Invalid ZIP file' });
  }
});

module.exports = router;
