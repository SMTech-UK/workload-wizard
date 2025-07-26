import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, CreditCard, HelpCircle, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useClerk } from "@clerk/nextjs"
import { Authenticated } from "convex/react"
import SettingsModal, { TabType } from "@/hooks/settings-modal"
import React from "react"
import { useTheme } from "next-themes";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UserProfileDropdownProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  modalOpen?: boolean;
  setModalOpen?: (open: boolean) => void;
  modalTab?: TabType;
  setModalTab?: (tab: TabType) => void;
}

export default function Component({ onProfileClick, onSettingsClick, modalOpen: controlledModalOpen, setModalOpen: setControlledModalOpen, modalTab: controlledModalTab, setModalTab: setControlledModalTab }: UserProfileDropdownProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [uncontrolledModalOpen, setUncontrolledModalOpen] = React.useState(false);
  const [uncontrolledModalTab, setUncontrolledModalTab] = React.useState<TabType>("profile");
  const modalOpen = controlledModalOpen !== undefined ? controlledModalOpen : uncontrolledModalOpen;
  const setModalOpen = setControlledModalOpen || setUncontrolledModalOpen;
  const modalTab = controlledModalTab !== undefined ? controlledModalTab : uncontrolledModalTab;
  const setModalTab = setControlledModalTab || setUncontrolledModalTab;
  const { setTheme, theme } = useTheme();
  const setSettings = useMutation(api.users.setSettings);
  const userSettings = useQuery(api.users.getSettings);

  if (!isLoaded || !user) return null;

  const handleProfileClick = () => {
    setModalTab("profile");
    setModalOpen(true);
    if (onProfileClick) onProfileClick();
  };
  const handleSettingsClick = () => {
    setModalTab("general");
    setModalOpen(true);
    if (onSettingsClick) onSettingsClick();
  };

  return (
    <Authenticated>
      <div className="flex justify-end p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative h-10 w-10 rounded-full overflow-hidden bg-transparent border-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-300 hover:ring-2 hover:ring-gray-300 ring-inset"
              type="button"
            >
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                <AvatarImage src={user.imageUrl || "/placeholder.svg?height=40&width=40"} alt="Profile" />
                <AvatarFallback>
                  {user.firstName && user.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : user.username?.slice(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                className="flex items-center w-full px-2 py-1.5 rounded-md transition-colors hover:bg-muted focus:bg-muted group"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                  await setSettings({
                    settings: {
                      theme: newTheme,
                      language: userSettings?.language ?? "en",
                      timezone: userSettings?.timezone ?? "GMT",
                      notifyEmail: userSettings?.notifyEmail ?? true,
                      notifyPush: userSettings?.notifyPush ?? true,
                      profilePublic: userSettings?.profilePublic ?? true,
                    }
                  });
                }}
                aria-pressed={theme === "dark"}
              >
                <Moon className="mr-2 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="flex-1 text-left">Dark Mode</span>
                <span className="ml-auto flex items-center">
                  <span
                    className={
                      `relative inline-block w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${theme === "dark" ? "bg-primary" : "bg-gray-300"}`
                    }
                  >
                    <span
                      className={
                        `absolute left-0 top-0 w-5 h-5 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out ${theme === "dark" ? "translate-x-5 border-primary" : "translate-x-0"}`
                      }
                    />
                  </span>
                </span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SettingsModal open={modalOpen} onOpenChange={setModalOpen} initialTab={modalTab} />
      </div>
    </Authenticated>
  )
}
