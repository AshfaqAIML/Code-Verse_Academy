"use client";

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

type EditorPanelProps = {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
  fontSize: number;
};

const EditorPanel = ({ language, value, onChange, theme, fontSize }: EditorPanelProps) => {
  const editorRef = useRef<any>(null);

  const getLanguage = (lang: string) => {
    const map = { html: 'html', css: 'css', javascript: 'javascript', js: 'javascript' };
    return map[lang as keyof typeof map] || lang;
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => { editor.getAction('editor.action.formatDocument').run(); }
    });
    
    editor.addAction({
      id: 'search-replace',
      label: 'Search & Replace',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
      run: () => { editor.getAction('editor.action.startFindReplaceAction').run(); }
    });
  };

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: fontSize,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on' as const,
    autoIndent: 'full' as const,
    formatOnPaste: true,
    formatOnType: true,
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true },
    suggest: { showMethods: true, showFunctions: true, showConstructors: true },
    quickSuggestions: true,
    parameterHints: { enabled: true },
    folding: true,
    renderLineHighlight: 'all' as const,
    smoothScrolling: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    padding: { top: 10 },
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <span className="editor-language">{language.toUpperCase()}</span>
        <div className="editor-actions">
          <button type="button" onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()} title="Format">
            🔧
          </button>
          <button type="button" onClick={() => editorRef.current?.getAction('editor.action.startFindReplaceAction')?.run()} title="Search & Replace">
            🔍
          </button>
        </div>
      </div>
      <Editor
        height="100%"
        language={getLanguage(language)}
        value={value}
        theme={monacoTheme}
        options={editorOptions}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        onMount={handleEditorDidMount}
        loading={<div className="editor-loading">Loading editor...</div>}
      />
    </div>
  );
};

export default EditorPanel;
