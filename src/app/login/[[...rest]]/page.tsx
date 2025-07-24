import { WandSparkles } from "lucide-react"
import { SignIn } from '@clerk/nextjs'


export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-blue-600 text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <WandSparkles className="size-4" />
          </div>
          WorkloadWizard
        </a>
        <SignIn />
      </div>
    </div>
  )
}
