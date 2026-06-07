const validateProject = (req, res, next) => {
  const { html, css, javascript } = req.body;
  const MAX_SIZE = 1024 * 1024; // 1MB limit per editor
  
  if (html && html.length > MAX_SIZE) return res.status(400).json({ error: 'HTML code is too large (Max 1MB)' });
  if (css && css.length > MAX_SIZE) return res.status(400).json({ error: 'CSS code is too large (Max 1MB)' });
  if (javascript && javascript.length > MAX_SIZE) return res.status(400).json({ error: 'JavaScript code is too large (Max 1MB)' });
  
  next();
};

module.exports = { validateProject };