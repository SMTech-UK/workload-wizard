"use client"

import { useState, Suspense } from "react"
import ModuleIterations from "@/components/features/module-management/module-iterations"
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"

export default function ModuleIterationsPage() {
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<TabType>("profile");

  const handleProfileClick = () => {
    setUserProfileModalTab("profile");
    setUserProfileModalOpen(true);
  };
  
  const handleSettingsClick = () => {
    setUserProfileModalTab("general");
    setUserProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="w-full bg-white dark:bg-zinc-900">
        <Navigation 
          activeTab="iterations" 
          setActiveTab={() => {}} 
          onProfileClick={handleProfileClick} 
          onSettingsClick={handleSettingsClick} 
          onInboxClick={() => {}}
        />
      </div>
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ModuleIterations />
        </Suspense>
      </main>
      <SettingsModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        initialTab={userProfileModalTab}
      />
    </div>
  )
} 