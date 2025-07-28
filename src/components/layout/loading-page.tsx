import { WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoadingPage({ progress = 0 }: { progress?: number }) {
  const [isDevMode, setIsDevMode] = useState(false);

  // Check dev mode from localStorage on client side only
  useEffect(() => {
    const devMode = localStorage.getItem('devMode') === 'true';
    setIsDevMode(devMode);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-black animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-14 h-14 flex items-center justify-center rounded-xl shadow-lg ${isDevMode ? 'bg-yellow-500' : 'bg-blue-600'}`}>
          <WandSparkles className="w-8 h-8 text-white animate-bounce-slow" />
        </span>
        <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight select-none">
          WorkloadWizard{isDevMode && <span className="text-yellow-600 dark:text-yellow-400"> Dev</span>}
        </span>
      </div>
      <div className={`h-2 w-32 rounded-full overflow-hidden ${isDevMode ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'}`} data-testid="progress-container">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isDevMode ? 'bg-yellow-500' : 'bg-blue-600'}`}
          style={{ width: `${progress}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}

// Tailwind custom animations (add to tailwind.config.js if not present):
// theme: {
//   extend: {
//     keyframes: {
//       'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
//       'bounce-slow': {
//         '0%, 100%': { transform: 'translateY(0)' },
//         '50%': { transform: 'translateY(-8px)' },
//       },
//       'loading-bar': {
//         '0%': { transform: 'translateX(-100%)' },
//         '100%': { transform: 'translateX(100%)' },
//       },
//     },
//     animation: {
//       'fade-in': 'fade-in 0.6s ease',
//       'bounce-slow': 'bounce-slow 1.4s infinite',
//       'loading-bar': 'loading-bar 1.2s cubic-bezier(0.4,0,0.2,1) infinite',
//     },
//   },
// }, 