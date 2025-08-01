"use client"

import { useState } from "react"
// import LecturerManagement from "@/components/features/lecturer-management/lecturer-management"
import Navigation from "@/components/layout/navigation"
import SettingsModal, { TabType } from "@/components/modals/settings-modal"

export default function LecturerManagementPage() {
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
          activeTab="lecturers" 
          setActiveTab={() => {}} 
          onProfileClick={handleProfileClick} 
          onSettingsClick={handleSettingsClick} 
          onInboxClick={() => {}}
        />
      </div>
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* <LecturerManagement /> */}
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Lecturer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This feature is being updated to work with the new database schema.
          </p>
        </div>
      </main>
      <SettingsModal
        open={userProfileModalOpen}
        onOpenChange={setUserProfileModalOpen}
        initialTab={userProfileModalTab}
      />
    </div>
  )
} 