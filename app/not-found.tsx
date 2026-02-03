import Link from "next/link";
import { Home } from "lucide-react";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Page Not Found',
  description: 'The page you are looking for does not exist. Return to Activo Store homepage.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 gap-4">
      <h2 className="text-4xl font-bold text-slate-900">404</h2>
      <p className="text-slate-600">Page not found</p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}