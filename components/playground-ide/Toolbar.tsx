"use client";

import React, { useRef } from "react";
import type { PlaygroundLibrary, PlaygroundProject } from "./types";

type ToolbarProps = {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  autoRun: boolean;
  setAutoRun: (value: boolean) => void;
  layout: 'horizontal' | 'vertical' | 'tabs';
  setLayout: (layout: 'horizontal' | 'vertical' | 'tabs') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  showConsole: boolean;
  setShowConsole: (value: boolean) => void;
  onRun: () => void;
  onSave: () => void;
  onClear: () => void;
  onShowTemplates: () => void;
  onShowLibraries: () => void;
  onShowProjects: () => void;
  onExport: (format: 'html' | 'zip' | 'json') => void;
  onImport: (file: File) => void;
  onFullscreen: () => void;
  project?: PlaygroundProject | null;
  isAuthenticated: boolean;
  cdnLibraries: PlaygroundLibrary[];
  isFullscreen: boolean;
};

const Toolbar = ({
  theme, setTheme, autoRun, setAutoRun, layout, setLayout,
  fontSize, setFontSize, showConsole, setShowConsole,
  onRun, onSave, onClear, onShowTemplates, onShowLibraries,
  onShowProjects, onExport, onImport, onFullscreen,
  project, isAuthenticated, cdnLibraries, isFullscreen
}: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="playground-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-group">
          <button onClick={onRun} className="toolbar-btn run-btn" title="Run Code (Ctrl+Enter)">
            ▶ Run
          </button>
          <label className="toolbar-toggle">
            <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} />
            <span>Auto Run</span>
          </label>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button onClick={onShowTemplates} className="toolbar-btn" title="Templates">
            📋 Templates
          </button>
          <button onClick={onShowLibraries} className="toolbar-btn" title="CDN Libraries">
            📦 Libraries
            {cdnLibraries.length > 0 && <span className="badge">{cdnLibraries.length}</span>}
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <div className="toolbar-select">
            <label>Layout:</label>
            <select value={layout} onChange={(e) => setLayout(e.target.value as 'horizontal' | 'vertical' | 'tabs')}>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="tabs">Tabs</option>
            </select>
          </div>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="toolbar-group">
            <div className="toolbar-select">
            <label>Theme:</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          <div className="toolbar-select">
            <label>Font:</label>
            <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
              {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button onClick={onShowProjects} className="toolbar-btn" title="Projects">
            📁 Projects
          </button>
          {isAuthenticated && (
            <button onClick={onSave} className="toolbar-btn save-btn" title="Save (Ctrl+S)">
              💾 Save
            </button>
          )}
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <div className="toolbar-dropdown">
            <button className="toolbar-btn" type="button">📥 Export</button>
            <div className="dropdown-menu">
              <button type="button" onClick={() => onExport('html')}>Export as HTML</button>
              <button type="button" onClick={() => onExport('zip')}>Export as ZIP</button>
              <button type="button" onClick={() => onExport('json')}>Export as JSON</button>
            </div>
          </div>
          
          <button onClick={() => fileInputRef.current?.click()} className="toolbar-btn">
            📤 Import
          </button>
          <input ref={fileInputRef} type="file" accept=".zip,.html,.json" onChange={handleImportFile} style={{ display: 'none' }} />
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button type="button" onClick={() => setShowConsole(!showConsole)} className="toolbar-btn" title="Toggle Console">
            {showConsole ? '🖥️ Hide Console' : '🖥️ Show Console'}
          </button>
          <button type="button" onClick={onClear} className="toolbar-btn danger" title="Clear All">
            🗑️ Clear
          </button>
          <button type="button" onClick={onFullscreen} className="toolbar-btn" title="Fullscreen">
            {isFullscreen ? '⬜ Exit Fullscreen' : '🔲 Fullscreen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
