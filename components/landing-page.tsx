import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { WandSparkles } from "lucide-react"

export default function WorkloadWizardLanding() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900 bg-[length:400%_400%]" />
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center">
      <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WandSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-400">WorkloadWizard</span>
            </div>
        <nav className="ml-auto">
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/30 backdrop-blur-sm shadow-md">
                  ✨ Transform Your Workflow
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
                  Effortless Academic Staffing
                  <span className="block text-purple-200">For Modern Institutions</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl leading-relaxed">
                  Simplify and clarify academic workload allocations for your institution.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-2 px-4 border-t border-white/20 bg-white/10 backdrop-blur-sm shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-white/70">© {new Date().getFullYear()} WorkloadWizard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
