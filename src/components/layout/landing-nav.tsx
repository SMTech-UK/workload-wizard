import { WandSparkles } from "lucide-react";

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
            </nav>
        </header>
    )
}