"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { PlaygroundProject, PlaygroundUser } from "./types";

type ProjectManagerProps = {
  user?: PlaygroundUser;
  currentProject: PlaygroundProject | null;
  onClose: () => void;
  theme: 'dark' | 'light';
};

const ProjectManager = ({ user, currentProject, onClose, theme }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<PlaygroundProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/playground/projects', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
      if (!confirm('Delete this project permanently?')) return;
    try {
      await fetch(`/api/playground/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/playground/projects/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const dup = await res.json();
      setProjects(prev => [dup, ...prev]);
    } catch (err) {
      alert('Failed to duplicate');
    }
  };

  const handleShare = (project: PlaygroundProject) => {
    const url = `${window.location.origin}/playground/project/${project.id ?? ""}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const filtered = projects.filter((p) => 
    (p.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content projects-modal theme-${theme}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 My Projects</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No projects found. Create your first one!</p>
            </div>
          ) : (
            <div className="projects-list">
              {filtered.map(project => (
                <div key={project.id} className={`project-item ${currentProject?.id === project.id ? 'current' : ''}`}>
                  <div className="project-info">
                    <h3>{project.title || 'Untitled'}</h3>
                    <p className="project-meta">
                      Updated: {new Date(project.updated_at ?? Date.now()).toLocaleDateString()} • 
                      Views: {project.view_count || 0}
                      {project.is_public && <span className="badge public">Public</span>}
                    </p>
                  </div>
                  <div className="project-actions">
                    <a href={`/playground/project/${project.id ?? ""}`} className="btn-small">Open</a>
                    <button onClick={() => handleShare(project)} title="Copy share link">🔗</button>
                    <button onClick={() => handleDuplicate(project.id ?? "")} title="Duplicate">📋</button>
                    <button onClick={() => handleDelete(project.id ?? "")} className="danger" title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
