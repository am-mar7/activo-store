import Link from "next/link";
import { Home } from "lucide-react";

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