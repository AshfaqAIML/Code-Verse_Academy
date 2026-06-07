"use client";

import React, { useRef, useEffect } from 'react';
import type { PlaygroundLogEntry } from './types';

type ConsolePanelProps = {
  logs: PlaygroundLogEntry[];
  onClear: () => void;
  height: number;
  onResize: (height: number) => void;
  theme: 'dark' | 'light';
};

const ConsolePanel = ({ logs, onClear, height, onResize, theme }: ConsolePanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    resizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = startYRef.current - e.clientY;
      const newHeight = Math.max(100, Math.min(500, startHeightRef.current + diff));
      onResize(newHeight);
    };
    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [height, onResize]);

  const getMethodIcon = (method: PlaygroundLogEntry['method']) => {
    const icons = { log: '📝', error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🐛', table: '📊' };
    return icons[method as keyof typeof icons] || '📝';
  };

  const getMethodClass = (method: PlaygroundLogEntry['method']) => {
    const classes = { error: 'console-error', warn: 'console-warn', info: 'console-info', debug: 'console-debug' };
    return classes[method as keyof typeof classes] || 'console-log';
  };

  return (
    <div className="console-panel" style={{ height: `${height}px` }}>
      <div className="console-resize-handle" onMouseDown={handleMouseDown} />
      <div className="console-header">
        <span className="console-title">Console ({logs.length})</span>
        <button type="button" onClick={onClear} className="console-clear">Clear</button>
      </div>
      <div className="console-content" ref={containerRef}>
        {logs.length === 0 ? (
          <div className="console-empty">No console output yet.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`console-entry ${getMethodClass(log.method)}`}>
              <span className="console-icon">{getMethodIcon(log.method)}</span>
              <span className="console-time">{log.timestamp}</span>
              <div className="console-message">
                {log.args.map((arg, i) => (
                  <span key={i} className="console-arg">{arg}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
