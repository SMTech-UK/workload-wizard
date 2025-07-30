import Link from "next/link";

export default function Footer() {
    return (
<footer className="py-3 px-4 bg-white/30 dark:bg-gray-950/30 backdrop-blur-sm">
<div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
  <p className="text-sm text-gray-500 dark:text-gray-300">© {new Date().getFullYear()} WorkloadWizard. All rights reserved.</p>
  <div className="flex gap-4 sm:gap-6">
    <Link href="#" className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
      Privacy
    </Link>
    <Link href="#" className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
      Terms
    </Link>
    <Link href="#" className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors">
      Contact
    </Link>
  </div>
</div>
</footer>
    )
}