const express = require('express');
const router = express.Router();
const JSZip = require('jszip');

// POST /api/playground/export/html
router.post('/html', (req, res) => {
  const { html, css, javascript, title } = req.body;
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Exported Project'}</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${javascript}</script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="${(title || 'project').replace(/[^a-z0-9]/gi, '_')}.html"`);
  res.send(fullHtml);
});

// POST /api/playground/export/json
router.post('/json', (req, res) => {
  const { html, css, javascript, title, cdn_libraries } = req.body;
  const projectData = { title, html, css, javascript, cdn_libraries, exportedAt: new Date().toISOString() };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${(title || 'project').replace(/[^a-z0-9]/gi, '_')}.json"`);
  res.json(projectData);
});

// POST /api/playground/export/zip
router.post('/zip', async (req, res) => {
  try {
    const { html, css, javascript, title } = req.body;
    const zip = new JSZip();
    
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title || 'Project'}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${html}
  <script src="script.js"></script>
</body>
</html>`;

    zip.file('index.html', indexHtml);
    zip.file('style.css', css || '');
    zip.file('script.js', javascript || '');
    zip.file('README.md', `# ${title || 'Project'}\nExported from CodeVerse Academy Playground.`);

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'project').replace(/[^a-z0-9]/gi, '_')}.zip"`);
    res.send(content);
  } catch (error) {
    console.error('ZIP Export Error:', error);
    res.status(500).json({ error: 'Failed to generate ZIP' });
  }
});

module.exports = router;