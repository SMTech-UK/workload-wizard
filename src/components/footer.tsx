import Link from "next/link";

export default function Footer() {
    return (
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
    )
}