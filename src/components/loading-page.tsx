import { WandSparkles } from "lucide-react";

export default function LoadingPage({ progress = 0 }: { progress?: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-14 h-14 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg">
          <WandSparkles className="w-8 h-8 text-white animate-bounce-slow" />
        </span>
        <span className="text-3xl font-bold text-gray-900 tracking-tight select-none">WorkloadWizard</span>
      </div>
      <div className="h-2 w-32 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
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
//       'bounce-slow': 'bounce 1.4s infinite',
//       'loading-bar': 'loading-bar 1.2s cubic-bezier(0.4,0,0.2,1) infinite',
//     },
//   },
// }, 