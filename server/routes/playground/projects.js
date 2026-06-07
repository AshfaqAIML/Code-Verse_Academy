// const express = require('express');
// const router = express.Router();
// const { v4: uuidv4 } = require('uuid');
// const db = require('../database/db');
// const { authMiddleware, optionalAuth } = require('../middleware/auth');
// const { validateProject } = require('../middleware/validators');

// // GET /api/projects - List user's projects
// router.get('/', authMiddleware, async (req, res) => {
//     try {
//         const { page = 1, limit = 20, sort = 'updated_at', order = 'DESC', search = '' } = req.query;
//         const offset = (page - 1) * limit;
        
//         let query = `SELECT id, title, description, is_public, created_at, updated_at, view_count
//             FROM playground_projects WHERE user_id = $1`;
//         const params = [req.user.id];
        
//         if (search) {
//             query += ` AND (title ILIKE $2 OR description ILIKE $2)`;
//             params.push(`%${search}%`);
//         }
        
//         query += ` ORDER BY ${sort} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
//         params.push(limit, offset);
        
//         const result = await db.query(query, params);
//         res.json({ projects: result.rows });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch projects' });
//     }
// });

// // GET /api/projects/:id - Get single project
// router.get('/:id', optionalAuth, async (req, res) => {
//     try {
//         const result = await db.query(`
//             SELECT p.*, u.username as author_name, u.avatar_url as author_avatar
//             FROM playground_projects p
//             LEFT JOIN users u ON p.user_id = u.id
//             WHERE p.id = $1
//         `, [req.params.id]);
        
//         if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
//         const project = result.rows[0];
//         if (!project.is_public && (!req.user || req.user.id !== project.user_id)) {
//             return res.status(403).json({ error: 'Access denied' });
//         }
        
//         await db.query('UPDATE playground_projects SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
//         project.view_count++;
//         res.json(project);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch project' });
//     }
// });

// // POST /api/projects - Create new project
// router.post('/', authMiddleware, validateProject, async (req, res) => {
//     try {
//         const { title, description, html, css, javascript, settings, cdn_libraries, is_public, forked_from } = req.body;
//         const id = uuidv4();
        
//         const result = await db.query(`
//             INSERT INTO playground_projects 
//             (id, user_id, title, description, html, css, javascript, settings, cdn_libraries, is_public, forked_from)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
//         `, [id, req.user.id, title || 'Untitled Project', description || '', html || '', css || '', 
//             javascript || '', JSON.stringify(settings || {}), JSON.stringify(cdn_libraries || []), is_public || false, forked_from || null]);
        
//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to create project' });
//     }
// });

// // PUT /api/projects/:id - Update project
// router.put('/:id', authMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, description, html, css, javascript, settings, cdn_libraries, is_public } = req.body;
        
//         const existing = await db.query('SELECT * FROM playground_projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
//         if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found or access denied' });
        
//         const current = existing.rows[0];
        
//         // Save version before update
//         await db.query(`
//             INSERT INTO playground_versions (project_id, version_number, title, html, css, javascript, settings, cdn_libraries, change_description)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Auto-saved version')
//         `, [id, current.version, current.title, current.html, current.css, current.javascript, current.settings, current.cdn_libraries]);
        
//         const result = await db.query(`
//             UPDATE playground_projects SET title = $1, description = $2, html = $3, css = $4,
//                 javascript = $5, settings = $6, cdn_libraries = $7, is_public = $8,
//                 version = version + 1, updated_at = CURRENT_TIMESTAMP
//             WHERE id = $9 RETURNING *
//         `, [title || current.title, description !== undefined ? description : current.description,
//             html !== undefined ? html : current.html, css !== undefined ? css : current.css,
//             javascript !== undefined ? javascript : current.javascript,
//             JSON.stringify(settings !== undefined ? settings : JSON.parse(current.settings)),
//             JSON.stringify(cdn_libraries !== undefined ? cdn_libraries : JSON.parse(current.cdn_libraries)),
//             is_public !== undefined ? is_public : current.is_public, id]);
        
//         res.json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to update project' });
//     }
// });

// // DELETE /api/projects/:id
// router.delete('/:id', authMiddleware, async (req, res) => {
//     try {
//         const result = await db.query('DELETE FROM playground_projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
//         if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
//         res.json({ message: 'Project deleted' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to delete' });
//     }
// });

// // POST /api/projects/:id/fork
// router.post('/:id/fork', authMiddleware, async (req, res) => {
//     try {
//         const original = await db.query('SELECT * FROM playground_projects WHERE id = $1 AND is_public = true', [req.params.id]);
//         if (original.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
//         const project = original.rows[0];
//         const forkId = uuidv4();
        
//         const result = await db.query(`
//             INSERT INTO playground_projects (id, user_id, title, description, html, css, javascript, settings, cdn_libraries, forked_from)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
//         `, [forkId, req.user.id, `Fork: ${project.title}`, project.description, project.html, project.css, 
//             project.javascript, project.settings, project.cdn_libraries, req.params.id]);
        
//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fork' });
//     }
// });

// // POST /api/projects/:id/duplicate
// router.post('/:id/duplicate', authMiddleware, async (req, res) => {
//     try {
//         const original = await db.query('SELECT * FROM playground_projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
//         if (original.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
//         const project = original.rows[0];
//         const dupId = uuidv4();
        
//         const result = await db.query(`
//             INSERT INTO playground_projects (id, user_id, title, description, html, css, javascript, settings, cdn_libraries)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
//         `, [dupId, req.user.id, `${project.title} (Copy)`, project.description, project.html, project.css, 
//             project.javascript, project.settings, project.cdn_libraries]);
        
//         res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to duplicate' });
//     }
// });

// // GET /api/projects/:id/versions
// router.get('/:id/versions', authMiddleware, async (req, res) => {
//     try {
//         const result = await db.query(`
//             SELECT id, version_number, title, change_description, created_at
//             FROM playground_versions WHERE project_id = $1 ORDER BY version_number DESC
//         `, [req.params.id]);
//         res.json(result.rows);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch versions' });
//     }
// });

// // GET /api/projects/public/explore - Public projects
// router.get('/public/explore', async (req, res) => {
//     try {
//         const { page = 1, limit = 20 } = req.query;
//         const offset = (page - 1) * limit;
//         const result = await db.query(`
//             SELECT p.id, p.title, p.description, p.view_count, p.created_at, u.username as author_name
//             FROM playground_projects p LEFT JOIN users u ON p.user_id = u.id
//             WHERE p.is_public = true ORDER BY p.created_at DESC LIMIT $1 OFFSET $2
//         `, [limit, offset]);
//         res.json({ projects: result.rows });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch public projects' });
//     }
// });

// module.exports = router;





// server/routes/playground/projects.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 🟢 MOCK DATABASE: Uses a local JSON file instead of PostgreSQL/MongoDB
const DB_PATH = path.join(__dirname, '../../playground-db.json');

// Helper functions to read/write the JSON file
const getProjects = () => {
  try {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]');
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
};

const saveProjects = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// GET /api/playground/projects - List user's projects
router.get('/', (req, res) => {
  const projects = getProjects();
  // Filter by mock user ID or return all for testing
  const userProjects = projects.filter(p => p.userId === req.user?.id || req.user?.id === 'guest-user-id');
  res.json({ projects: userProjects });
});

// GET /api/playground/projects/:id - Get single project
router.get('/:id', (req, res) => {
  const projects = getProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  
  // Increment view count
  project.view_count = (project.view_count || 0) + 1;
  saveProjects(projects);
  
  res.json(project);
});

// POST /api/playground/projects - Create new project
router.post('/', (req, res) => {
  const projects = getProjects();
  const { title, html, css, javascript, cdn_libraries } = req.body;
  
  const newProject = {
    id: uuidv4(),
    userId: req.user?.id || 'guest-user-id',
    title: title || 'Untitled Project',
    html: html || '',
    css: css || '',
    javascript: javascript || '',
    cdn_libraries: cdn_libraries || [],
    is_public: false,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.unshift(newProject);
  saveProjects(projects);
  res.status(201).json(newProject);
});

// PUT /api/playground/projects/:id - Update project
router.put('/:id', (req, res) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === req.params.id);
  
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  if (projects[index].userId !== req.user?.id) return res.status(403).json({ error: 'Access denied' });
  
  const { title, html, css, javascript, cdn_libraries } = req.body;
  
  projects[index] = {
    ...projects[index],
    title: title !== undefined ? title : projects[index].title,
    html: html !== undefined ? html : projects[index].html,
    css: css !== undefined ? css : projects[index].css,
    javascript: javascript !== undefined ? javascript : projects[index].javascript,
    cdn_libraries: cdn_libraries !== undefined ? cdn_libraries : projects[index].cdn_libraries,
    updated_at: new Date().toISOString()
  };
  
  saveProjects(projects);
  res.json(projects[index]);
});

// DELETE /api/playground/projects/:id
router.delete('/:id', (req, res) => {
  let projects = getProjects();
  const target = projects.find(p => p.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Not found' });
  if (target.userId !== req.user?.id) return res.status(403).json({ error: 'Access denied' });
  projects = projects.filter(p => p.id !== req.params.id);
  saveProjects(projects);
  res.json({ message: 'Deleted' });
});

// POST /api/playground/projects/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  const projects = getProjects();
  const original = projects.find(p => p.id === req.params.id);
  if (!original) return res.status(404).json({ error: 'Not found' });
  if (original.userId !== req.user?.id) return res.status(403).json({ error: 'Access denied' });
  
  const dup = {
    ...original,
    id: uuidv4(),
    title: `${original.title} (Copy)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.unshift(dup);
  saveProjects(projects);
  res.status(201).json(dup);
});

// POST /api/playground/projects/:id/fork
router.post('/:id/fork', (req, res) => {
  const projects = getProjects();
  const original = projects.find(p => p.id === req.params.id);
  if (!original) return res.status(404).json({ error: 'Not found' });
  if (original.userId !== req.user?.id) return res.status(403).json({ error: 'Access denied' });
  
  const fork = {
    ...original,
    id: uuidv4(),
    title: `Fork: ${original.title}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.unshift(fork);
  saveProjects(projects);
  res.status(201).json(fork);
});

module.exports = router;