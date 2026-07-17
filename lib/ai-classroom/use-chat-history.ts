"use client";

import { useState, useEffect, useCallback } from "react";

export function useChatHistory<T>(storageKey: string) {
  const [messages, setMessages] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages, hydrated, storageKey]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  return { messages, setMessages, clearMessages, hydrated };
}
