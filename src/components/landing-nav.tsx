import { Unauthenticated, Authenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { WandSparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfileDropdown from "./user-profile-dropdown";
import Link from "next/link";

export default function LandingNav() {
    return (
        <header className="px-4 lg:px-6 h-16 flex items-center bg-white/30 dark:bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                    <WandSparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">WorkloadWizard</span>
            </div>
            <nav className="ml-auto flex items-center gap-2">
            <Unauthenticated>
                <SignInButton mode="modal">
                  <Button variant="default">Sign In</Button>
                </SignInButton>
            </Unauthenticated>
            <Authenticated>
                <Link href="/dashboard">
                  <Button variant="default" className="px-4 py-2 text-sm font-semibold">Dashboard</Button>
                </Link>
                <UserProfileDropdown />
            </Authenticated>
            </nav>
        </header>
    )
}
