"use client";

import React, { useState, useEffect } from "react";
import type { PlaygroundTemplate } from "./types";

type TemplateSelectorProps = {
  onSelect: (template: PlaygroundTemplate) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
};

const TemplateSelector = ({ onSelect, onClose, theme }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<PlaygroundTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('/api/playground/templates')
      .then(res => res.json())
      .then(data => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(templates.map((t) => t.category))];
  const filtered = selectedCategory === 'all' ? templates : templates.filter(t => t.category === selectedCategory);

  const handleSelect = async (templateId: string) => {
    try {
      const res = await fetch(`/api/playground/templates/${templateId}`);
      const template = await res.json();
      onSelect(template);
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content template-modal theme-${theme}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Choose a Template</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="loading">Loading templates...</div>
          ) : (
            <div className="templates-grid">
              {filtered.map(template => (
                <div key={template.id} className="template-card" onClick={() => handleSelect(template.id)}>
                  <div className="template-icon">{template.icon}</div>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <span className="template-category">{template.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
