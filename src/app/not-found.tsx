import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Page Not Found
        </h2>
        <p className="mb-6 text-muted-foreground">
          Could not find the requested resource
        </p>
        <Link
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 