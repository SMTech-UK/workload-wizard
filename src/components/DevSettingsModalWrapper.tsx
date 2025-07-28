"use client";

import React from 'react';
import DevSettingsModal from './DevSettingsModal';
import { useDevSettings } from '../hooks/useDevSettings';

export default function DevSettingsModalWrapper() {
  const { isDevSettingsOpen, closeDevSettings } = useDevSettings();

  return (
    <DevSettingsModal 
      isOpen={isDevSettingsOpen} 
      onClose={closeDevSettings} 
    />
  );
} 