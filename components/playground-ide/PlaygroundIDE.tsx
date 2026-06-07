"use client";

import React, { useEffect, useRef, useState } from "react";
import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";
import ConsolePanel from "./ConsolePanel";
import Toolbar from "./Toolbar";
import TemplateSelector from "./TemplateSelector";
import LibraryManager from "./LibraryManager";
import ProjectManager from "./ProjectManager";
import { useProject } from "./hooks/useProject";
import { useConsole } from "./hooks/useConsole";
import type { PlaygroundLibrary, PlaygroundProject, PlaygroundUser } from "./types";

const normalizeLibraries = (value: PlaygroundLibrary[] | string | undefined | null): PlaygroundLibrary[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

type PlaygroundProps = {
  projectId?: string;
  user?: PlaygroundUser;
  isAuthenticated: boolean;
};

const Playground = ({ projectId, user, isAuthenticated }: PlaygroundProps) => {
  const [layout, setLayout] = useState<"horizontal" | "vertical" | "tabs">("horizontal"); // horizontal, vertical, tabs
  const [activeEditor, setActiveEditor] = useState<"html" | "css" | "javascript">("html");
  const [autoRun, setAutoRun] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fontSize, setFontSize] = useState(14);
  const [showConsole, setShowConsole] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLibraries, setShowLibraries] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [cdnLibraries, setCdnLibraries] = useState<PlaygroundLibrary[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [runTick, setRunTick] = useState(0);
  
  const { project, saveProject } = useProject(projectId, user);
  const { logs, addLog, clearLogs } = useConsole();
  
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [javascript, setJavascript] = useState("");
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load project data
  useEffect(() => {
    if (project) {
      setHtml(project.html || "");
      setCss(project.css || "");
      setJavascript(project.javascript || "");
      setCdnLibraries(normalizeLibraries(project.cdn_libraries));
    }
  }, [project]);

  // Auto-save
  useEffect(() => {
    if (!isAuthenticated || !project?.id) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProject({ html, css, javascript, cdn_libraries: cdnLibraries });
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [html, css, javascript, cdnLibraries, isAuthenticated, project?.id, saveProject]);

  const handleTemplateSelect = (template: PlaygroundProject) => {
    setHtml(template.html || "");
    setCss(template.css || "");
    setJavascript(template.javascript || "");
    setCdnLibraries(normalizeLibraries(template.cdn_libraries));
    setShowTemplates(false);
  };

  const handleClearAll = () => {
    if (confirm('Clear all code? This cannot be undone.')) {
      setHtml("");
      setCss("");
      setJavascript("");
      clearLogs();
    }
  };

  const handleRun = () => {
    setRunTick((tick) => tick + 1);
  };

  const handleExport = async (format: "html" | "zip" | "json") => {
    try {
      const response = await fetch(`/api/playground/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({
          projectId: project?.id,
          title: project?.title,
          html,
          css,
          javascript,
          cdnLibraries
        })
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.title || 'project'}.${format === 'zip' ? 'zip' : format === 'html' ? 'html' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'json') as 'zip' | 'html' | 'json';
      const type = ext === 'zip' ? 'zip' : ext === 'html' ? 'html' : 'json';
      
      const response = await fetch(`/api/playground/import/${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
        body: formData
      });
      
      if (!response.ok) throw new Error('Import failed');
      const imported = await response.json();
      setHtml(imported.html || '');
      setCss(imported.css || '');
      setJavascript(imported.javascript || '');
      setCdnLibraries(normalizeLibraries(imported.cdn_libraries));
    } catch (err) {
      alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className={`playground-container theme-${theme} layout-${layout} ${isFullscreen ? 'fullscreen' : ''}`}>
      <Toolbar
        theme={theme}
        setTheme={setTheme}
        autoRun={autoRun}
        setAutoRun={setAutoRun}
        layout={layout}
        setLayout={setLayout}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showConsole={showConsole}
        setShowConsole={setShowConsole}
        onRun={handleRun}
        onSave={() => saveProject({ html, css, javascript })}
        onClear={handleClearAll}
        onShowTemplates={() => setShowTemplates(true)}
        onShowLibraries={() => setShowLibraries(true)}
        onShowProjects={() => setShowProjects(true)}
        onExport={handleExport}
        onImport={handleImport}
        onFullscreen={() => setIsFullscreen(!isFullscreen)}
        project={project}
        isAuthenticated={isAuthenticated}
        cdnLibraries={cdnLibraries}
        isFullscreen={isFullscreen}
      />

      <div className="playground-main">
        <div className="editors-section">
          {layout === 'tabs' ? (
            <div className="editor-tabs">
              <div className="tab-buttons">
                {(['html', 'css', 'javascript'] as const).map((lang) => (
                  <button
                    key={lang}
                    className={`tab-btn ${activeEditor === lang ? 'active' : ''}`}
                    onClick={() => setActiveEditor(lang)}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <EditorPanel
                language={activeEditor}
                value={activeEditor === 'html' ? html : activeEditor === 'css' ? css : javascript}
                onChange={(val) => {
                  if (activeEditor === 'html') setHtml(val ?? "");
                  else if (activeEditor === 'css') setCss(val ?? "");
                  else setJavascript(val ?? "");
                }}
                theme={theme}
                fontSize={fontSize}
              />
            </div>
          ) : (
            <div className={`editors-grid ${layout}`}>
              <EditorPanel language="html" value={html} onChange={setHtml} theme={theme} fontSize={fontSize} />
              <EditorPanel language="css" value={css} onChange={setCss} theme={theme} fontSize={fontSize} />
              <EditorPanel language="javascript" value={javascript} onChange={setJavascript} theme={theme} fontSize={fontSize} />
            </div>
          )}
        </div>

        <div className="preview-section">
          <PreviewPanel
            html={html}
            css={css}
            javascript={javascript}
            cdnLibraries={cdnLibraries}
            autoRun={autoRun}
            onConsoleLog={addLog}
            theme={theme}
            runTick={runTick}
          />
        </div>
      </div>

      {showConsole && (
        <ConsolePanel
          logs={logs}
          onClear={clearLogs}
          height={consoleHeight}
          onResize={setConsoleHeight}
          theme={theme}
        />
      )}

      {/* Modals */}
      {showTemplates && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
          theme={theme}
        />
      )}
      {showLibraries && (
        <LibraryManager
          libraries={cdnLibraries}
          onChange={setCdnLibraries}
          onClose={() => setShowLibraries(false)}
          theme={theme}
        />
      )}
      {showProjects && isAuthenticated && (
        <ProjectManager
          user={user}
          currentProject={project}
          onClose={() => setShowProjects(false)}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Playground;
