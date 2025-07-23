import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { WandSparkles } from "lucide-react"

export default function WorkloadWizardLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center">
      <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <WandSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WorkloadWizard</span>
            </div>
        <nav className="ml-auto">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  ✨ Transform Your Workflow
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Academic Workload Staffing
                  <span className="block text-blue-600">Made Easy & Transparent</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 text-lg md:text-xl leading-relaxed">
                  WorkloadWizard is a tool for universities and colleges to easily and transparently manage academic workload staffing allocations. Simplify the process of assigning teaching, research, and service duties—ensuring fairness, clarity, and efficiency for all staff.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-4 border-t bg-white/50">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} WorkloadWizard. All rights reserved.</p>
          <div className="flex gap-6 mt-2 sm:mt-0">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
