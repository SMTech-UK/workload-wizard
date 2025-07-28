"use client";

import React from 'react';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { useDevSettings } from '../hooks/useDevSettings';

export default function FloatingDevSettingsButton() {
  const { openDevSettings } = useDevSettings();

  return (
    <Button
      onClick={openDevSettings}
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-yellow-500 hover:bg-yellow-600 text-white"
      title="Development Settings"
    >
      <Settings className="w-5 h-5" />
    </Button>
  );
} 