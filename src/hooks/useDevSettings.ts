"use client";

import { useState, useEffect } from 'react';

let globalDevSettingsState = {
  isOpen: false,
  listeners: new Set<() => void>(),
};

export function useDevSettings() {
  const [isDevSettingsOpen, setIsDevSettingsOpen] = useState(globalDevSettingsState.isOpen);

  useEffect(() => {
    const listener = () => {
      setIsDevSettingsOpen(globalDevSettingsState.isOpen);
    };

    globalDevSettingsState.listeners.add(listener);

    return () => {
      globalDevSettingsState.listeners.delete(listener);
    };
  }, []);

  const openDevSettings = () => {
    globalDevSettingsState.isOpen = true;
    globalDevSettingsState.listeners.forEach(listener => listener());
  };

  const closeDevSettings = () => {
    globalDevSettingsState.isOpen = false;
    globalDevSettingsState.listeners.forEach(listener => listener());
  };

  const toggleDevSettings = () => {
    globalDevSettingsState.isOpen = !globalDevSettingsState.isOpen;
    globalDevSettingsState.listeners.forEach(listener => listener());
  };

  return {
    isDevSettingsOpen,
    openDevSettings,
    closeDevSettings,
    toggleDevSettings,
  };
} 