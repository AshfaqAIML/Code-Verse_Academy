// Connects the Playground to your existing CodeVerse Auth system
const authMiddleware = (req, res, next) => {
  /* 
    TODO: REPLACE THIS with your actual CodeVerse JWT verification later.
    Example:
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
  */
  
  // Dummy fallback so the playground works while you test:
  if (!req.user) {
    req.user = { id: 'guest-user-id', username: 'Guest' }; 
  }
  next();
};

const optionalAuth = (req, res, next) => {
  if (!req.user) req.user = { id: null };
  next();
};

module.exports = { authMiddleware, optionalAuth };