import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, CreditCard, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Authenticated } from "convex/react"
import SettingsModal, { TabType } from "@/hooks/settings-modal"
import React from "react"

interface UserProfileDropdownProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Component({ onProfileClick, onSettingsClick }: UserProfileDropdownProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTab, setModalTab] = React.useState<TabType>("profile");

  if (!isLoaded || !user) return null;

  const handleProfileClick = () => {
    setModalTab("profile");
    setModalOpen(true);
    if (onProfileClick) onProfileClick();
  };

  return (
    <Authenticated>
      <div className="flex justify-end p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-gray-300 focus:ring-gray-300 transition-all">
              <Avatar className="h-10 w-10">
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
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600">
              <Link href="/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SettingsModal open={modalOpen} onOpenChange={setModalOpen} initialTab={modalTab} />
      </div>
    </Authenticated>
  )
}
