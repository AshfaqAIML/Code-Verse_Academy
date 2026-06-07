"use client";

import { useState, useEffect, useCallback } from 'react';
import type { PlaygroundProject, PlaygroundUser } from '../types';

export const useProject = (projectId?: string, user?: PlaygroundUser) => {
  const [project, setProject] = useState<PlaygroundProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject({ id: null, html: '', css: '', javascript: '' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const headers: HeadersInit | undefined = user?.token ? { Authorization: `Bearer ${user.token}` } : undefined;
      const res = await fetch(`/api/playground/projects/${projectId}`, { headers });
      
      if (!res.ok) throw new Error('Project not found');
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      // Load empty project if not found
      setProject({ id: null, html: '', css: '', javascript: '' });
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.token]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const createProject = async (data: Partial<PlaygroundProject>) => {
    if (!user?.token) return null;
    
    try {
      const res = await fetch('/api/playground/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to create project');
      const newProject = await res.json();
      setProject(newProject);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  const saveProject = async (data: Partial<PlaygroundProject>) => {
    if (!user?.token) return;
    
    try {
      setSaving(true);
      
      if (!project?.id) {
        await createProject({ ...data, title: 'Untitled Project' });
      } else {
        const res = await fetch(`/api/playground/projects/${project.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error('Failed to save');
        const updated = await res.json();
        setProject(updated);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateCode = (field: keyof PlaygroundProject, value: PlaygroundProject[keyof PlaygroundProject]) => {
    setProject(prev => prev ? { ...prev, [field]: value } : null);
  };

  return { project, loading, error, saving, saveProject, createProject, updateCode, refetch: fetchProject };
};
