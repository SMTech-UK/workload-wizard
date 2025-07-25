import { Unauthenticated, Authenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
    return (
        <header className="px-4 lg:px-6 h-16 flex items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <WandSparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WorkloadWizard</span>
            </div>
            <nav className="ml-auto flex items-center gap-2">
                <Authenticated>
                    <Button variant="outline">
                        <a href="/dashboard">Dashboard</a>
                    </Button>
                    <UserButton/>
                </Authenticated>
                <Unauthenticated>
                    <SignInButton mode="modal">
                        <Button variant="outline">Sign In</Button>
                    </SignInButton>
                </Unauthenticated>
            </nav>
        </header>
    )
}
