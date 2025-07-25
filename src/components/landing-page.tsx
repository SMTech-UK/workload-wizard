import { Badge } from "@/components/ui/badge"
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import Link from "next/link";

export default function LandingHero() {
  const { isAuthenticated } = useStoreUserEffect();
  return (
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-tr from-pink-500 via-blue-500 to-green-400 opacity-60 dark:opacity-40 blur-2xl" style={{backgroundSize: '200% 200%'}} />
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
              <div className="space-y-6">
                <Badge className="bg-transparent border-2 border-transparent bg-clip-padding relative px-4 py-1 text-white font-bold text-base shadow-none"
                  style={{
                    borderImage: 'linear-gradient(90deg, #f472b6, #60a5fa, #34d399, #fbbf24, #f472b6) 1',
                    background: 'none',
                  }}>
                  <span className="relative z-10">✨ Transform Your Workflow</span>
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-white">
                  Academic Workload Staffing
                  <span className="block text-blue-600 dark:text-blue-400">Made Easy & Transparent</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed">
                  WorkloadWizard is a tool for universities and colleges to easily and transparently manage academic workload staffing allocations. Simplify the process of assigning teaching, research, and service duties—ensuring fairness, clarity, and efficiency for all staff.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
  )
}
