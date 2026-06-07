"use client";

import React, { useState } from 'react';
import type { PlaygroundLibrary } from './types';

const AVAILABLE_LIBRARIES: Array<PlaygroundLibrary & { description: string }> = [
  { name: 'Bootstrap 5', type: 'css', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', description: 'Popular CSS framework' },
  { name: 'Bootstrap JS', type: 'js', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', description: 'Bootstrap JavaScript' },
  { name: 'Tailwind CSS', type: 'css', url: 'https://cdn.tailwindcss.com', description: 'Utility-first CSS' },
  { name: 'React 18', type: 'js', url: 'https://unpkg.com/react@18/umd/react.development.js', description: 'React library' },
  { name: 'ReactDOM 18', type: 'js', url: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js', description: 'React DOM' },
  { name: 'Babel Standalone', type: 'js', url: 'https://unpkg.com/@babel/standalone/babel.min.js', description: 'JSX transformation' },
  { name: 'Vue.js 3', type: 'js', url: 'https://unpkg.com/vue@3/dist/vue.global.js', description: 'Vue.js framework' },
  { name: 'Alpine.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js', description: 'Minimal JS framework' },
  { name: 'jQuery', type: 'js', url: 'https://code.jquery.com/jquery-3.7.1.min.js', description: 'DOM manipulation' },
  { name: 'Chart.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/chart.js', description: 'Charting library' },
  { name: 'GSAP', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', description: 'Animation library' },
  { name: 'Three.js', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', description: '3D graphics' },
  { name: 'D3.js', type: 'js', url: 'https://d3js.org/d3.v7.min.js', description: 'Data visualization' },
  { name: 'Lodash', type: 'js', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js', description: 'Utility functions' },
  { name: 'Moment.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js', description: 'Date manipulation' },
  { name: 'Axios', type: 'js', url: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js', description: 'HTTP client' },
  { name: 'Animate.css', type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css', description: 'CSS animations' },
  { name: 'Font Awesome', type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', description: 'Icon library' },
  { name: 'Google Fonts - Inter', type: 'css', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', description: 'Google Font' },
  { name: 'Marked.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', description: 'Markdown parser' },
];

type LibraryManagerProps = {
  libraries: PlaygroundLibrary[];
  onChange: (libraries: PlaygroundLibrary[]) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
};

const LibraryManager = ({ libraries, onChange, onClose, theme }: LibraryManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<'js' | 'css'>('js');

  const filteredLibraries = AVAILABLE_LIBRARIES.filter(lib =>
    lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLibrary = (lib: PlaygroundLibrary) => {
    const exists = libraries.find(l => l.url === lib.url);
    if (exists) {
      onChange(libraries.filter(l => l.url !== lib.url));
    } else {
      onChange([...libraries, { name: lib.name, type: lib.type, url: lib.url }]);
    }
  };

  const addCustom = () => {
    if (customUrl && customName) {
      onChange([...libraries, { name: customName, type: customType, url: customUrl }]);
      setCustomUrl('');
      setCustomName('');
    }
  };

  const removeLibrary = (index: number) => {
    onChange(libraries.filter((_, i) => i !== index));
  };

  const isEnabled = (url: string) => libraries.some(l => l.url === url);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content library-modal theme-${theme}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦 CDN Libraries</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        
        <div className="modal-body">
          {/* Active Libraries */}
          {libraries.length > 0 && (
            <div className="active-libraries">
              <h3>Active Libraries ({libraries.length})</h3>
              <div className="library-tags">
                {libraries.map((lib, index) => (
                  <span key={index} className="library-tag">
                    {lib.name}
                    <button onClick={() => removeLibrary(index)}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search libraries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Available Libraries */}
          <div className="libraries-grid">
            {filteredLibraries.map((lib, index) => (
              <div key={index} className={`library-card ${isEnabled(lib.url) ? 'active' : ''}`} onClick={() => toggleLibrary(lib)}>
                <div className="library-info">
                  <span className="library-name">{lib.name}</span>
                  <span className="library-desc">{lib.description}</span>
                  <span className={`library-type ${lib.type}`}>{lib.type.toUpperCase()}</span>
                </div>
                <div className="library-toggle">
                  {isEnabled(lib.url) ? '✓' : '+'}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Library */}
          <div className="custom-library">
            <h3>Add Custom Library</h3>
            <div className="custom-form">
              <input type="text" placeholder="Library name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <input type="text" placeholder="CDN URL" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
              <select value={customType} onChange={(e) => setCustomType(e.target.value as 'js' | 'css')}>
                <option value="js">JavaScript</option>
                <option value="css">CSS</option>
              </select>
              <button onClick={addCustom} disabled={!customUrl || !customName}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryManager;
