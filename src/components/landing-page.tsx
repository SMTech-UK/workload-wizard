import { Badge } from "@/components/ui/badge"

export default function LandingHero() {
  return (
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
  )
}
