"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, BookOpen, FileText, Settings, Bell, WandSparkles, Mail, Menu, GraduationCap, Calendar, Share2, TestTube, Bug, Code, Database, Monitor } from "lucide-react"
import { TabType } from "@/components/modals/settings-modal";
import UserProfileDropdown from "../forms/user-profile-dropdown"
import { Notifications } from "@/components/features/notifications/notifications"
import { KnockSafeWrapper } from "@/components/features/notifications/KnockErrorBoundary"
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDevMode } from "@/hooks/useDevMode";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
  const { shouldShowDevTools } = useDevMode();
  
  const baseNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "lecturers", label: "Lecturers", icon: Users, href: "/lecturer-management" },
    { id: "modules", label: "Modules", icon: GraduationCap, href: "/module-management" },
    { id: "iterations", label: "Iterations", icon: Calendar, href: "/module-iterations" },
    { id: "allocations", label: "Allocations", icon: Share2, href: "/module-allocations" },
    { id: "inbox", label: "Inbox", icon: Mail, href: "/inbox" },
  ];

  const devNavItems = [
    { id: "dev-tools", label: "Dev Tools", icon: Bug, href: "/dev-tools" },
    { id: "tests", label: "Tests", icon: TestTube, href: "/dev-tools?tab=test-dashboard" },
    { id: "api-tester", label: "API", icon: Code, href: "/dev-tools?tab=api-tester" },
    { id: "database", label: "Database", icon: Database, href: "/dev-tools?tab=database" },
    { id: "system-monitor", label: "System Monitor", icon: Monitor, href: "/dev-tools?tab=monitoring" },
    { id: "logs", label: "Logs", icon: FileText, href: "/dev-tools?tab=logs" },
  ];

  const navItems = baseNavItems;
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

  // Reusable NavButton component for navigation items
  function NavButton({ item, isActive, onClick, className }: {
    item: typeof navItems[number];
    isActive: boolean;
    onClick: () => void;
    className?: string;
  }) {
    return (
      <Button
        key={item.id}
        variant={isActive ? "default" : "ghost"}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2",
          className,
          isActive && "bg-blue-600 text-white dark:bg-blue-500 dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
        )}
      >
        <item.icon className="w-4 h-4 text-gray-900 dark:text-white" />
        <span className="text-gray-900 dark:text-white">{item.label}</span>
      </Button>
    );
  }

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${shouldShowDevTools ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                <WandSparkles className="w-5 h-5 text-white" data-testid="wand-sparkles" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                WorkloadWizard{shouldShowDevTools && <span className="text-yellow-600 dark:text-yellow-400"> Dev</span>}
              </span>
            </div>
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                const isActive = (item.href && pathname === item.href) || (!item.href && activeTab === item.id);
                return (
                  <NavButton
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                  />
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
            <KnockSafeWrapper fallback={
              <Button variant="ghost" size="icon" className="p-2 relative">
                <Bell width={16} />
              </Button>
            }>
              <Notifications />
            </KnockSafeWrapper>
            {shouldShowDevTools && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="p-2 bg-yellow-500 hover:bg-yellow-600"
                   title="Dev Tools"
                 >
                   <Bug className="w-5 h-5 text-black font-bold drop-shadow-sm" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel className="flex items-center gap-2">
                   <Bug className="w-4 h-4 drop-shadow-sm" />
                   Development Tools
                   <Badge className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold border-black">DEV</Badge>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {devNavItems.map((item) => (
                   <DropdownMenuItem 
                     key={item.id}
                     onClick={() => router.push(item.href)}
                   >
                     <item.icon className="w-4 h-4 mr-2" />
                     {item.label}
                   </DropdownMenuItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
            )}
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
              const isActive = (item.href && pathname === item.href) || (!item.href && activeTab === item.id);
              return (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    } else {
                      setActiveTab(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                />
              );
            })}
            {/* Dev items in mobile menu */}
            {shouldShowDevTools && (
              <>
                <div className="pt-2 pb-1">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1">
                    Development
                  </div>
                </div>
                {devNavItems.map((item) => {
                  const isActive = Boolean(item.href && pathname === item.href);
                  return (
                    <NavButton
                      key={item.id}
                      item={item}
                      isActive={isActive}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    />
                  );
                })}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
