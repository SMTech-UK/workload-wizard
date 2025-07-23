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
import { useUser } from "@auth0/nextjs-auth0"

interface UserProfileDropdownProps {
  isLoggedIn?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export default function Component({
  // props are no longer used
}: UserProfileDropdownProps) {
  const router = useRouter();
  const { user: auth0User, isLoading } = useUser();

  const loggedIn = !!auth0User;
  return (
    <div className="flex justify-end p-4">
      {loggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-gray-300 focus:ring-gray-300 transition-all">
              <Avatar className="h-10 w-10">
                <AvatarImage src={auth0User?.picture || "/placeholder.svg?height=40&width=40"} alt="Profile" />
                <AvatarFallback>
                  {auth0User?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{auth0User?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{auth0User?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
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
      ) : (
        <Button variant="outline" onClick={() => router.push('/auth/login')}>Log In</Button>
      )}
    </div>
  )
}
