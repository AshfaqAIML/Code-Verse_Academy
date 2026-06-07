"use client";

import { useState, useCallback } from 'react';
import type { PlaygroundLogEntry } from '../types';

export const useConsole = () => {
  const [logs, setLogs] = useState<PlaygroundLogEntry[]>([]);

  const addLog = useCallback((log: PlaygroundLogEntry) => {
    setLogs(prev => [...prev.slice(-500), log]); // Keep last 500 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
};
