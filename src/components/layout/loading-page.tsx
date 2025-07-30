import { WandSparkles } from "lucide-react";

export default function LoadingPage({ progress = 0 }: { progress?: number }) {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-black animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <span className='w-14 h-14 flex items-center justify-center rounded-xl shadow-lg bg-blue-600'>
          <WandSparkles className="w-8 h-8 text-white animate-bounce-slow" />
        </span>
        <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight select-none">
          WorkloadWizard
        </span>
      </div>
      <div className='h-2 w-32 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900' data-testid="progress-container">
        <div
          className='h-full rounded-full transition-all duration-300 bg-blue-600'
          style={{ width: `${progress}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}