"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, BookOpen, FileText, Settings, Bell, WandSparkles, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@auth0/nextjs-auth0"
import UserProfile from "./user-profile-dropdown"
import { useState } from "react"
import { Menu } from "lucide-react"
import { TabType } from "@/hooks/settings-modal";
import UserProfileDropdown from "./user-profile-dropdown"
import { Notifications } from "@/components/notifications"
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onInboxClick?: () => void;
}

export default function Navigation({ activeTab, setActiveTab, onProfileClick, onSettingsClick }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "lecturers", label: "Lecturers", icon: Users },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "inbox", label: "Inbox", icon: Bell, href: "/inbox" },
  ]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<TabType>("profile");
  const handleProfileClick = () => {
    setProfileModalTab("profile");
    setProfileModalOpen(true);
  };
  const handleSettingsClick = () => {
    setProfileModalTab("settings");
    setProfileModalOpen(true);
  };
  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WandSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">WorkloadWizard</span>
            </div>
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                const isActive = (item.href && pathname === item.href) || (!item.href && activeTab === item.id);
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-blue-600 text-white dark:bg-blue-500 dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                    )}
                  >
                    <item.icon className="w-4 h-4 text-gray-900 dark:text-white" />
                    <span className="text-gray-900 dark:text-white">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
            {/* Hamburger for mobile/tablet */}
            <button
              className="lg:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 overflow-visible">
            <Notifications />
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="w-5 h-5 text-gray-900 dark:text-white" />
            </Button>
            <div className="flex items-center gap-2">
              <UserProfileDropdown
                onProfileClick={onProfileClick}
                onSettingsClick={onSettingsClick}
                modalOpen={profileModalOpen}
                setModalOpen={setProfileModalOpen}
                modalTab={profileModalTab}
                setModalTab={setProfileModalTab}
              />
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden flex flex-col gap-1 pb-4 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full justify-start",
                    isActive && "bg-blue-600 text-white dark:bg-blue-500 dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                  )}
                >
                  <item.icon className="w-4 h-4 text-gray-900 dark:text-white" />
                  <span className="text-gray-900 dark:text-white">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
