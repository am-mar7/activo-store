'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import ROUTES from '@/constants/routes';

export function FastNavigation() {
  const { data: session } = useSession();

  if (!session?.user?.role || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <Link
        href={ROUTES.DASHBOARD}
        className={cn(
          "flex-center gap-0 bg-primary-gradient text-primary-foreground",
          "py-3 pl-3 pr-3 rounded-l-full shadow-lg text-neutral-50",
          "transition-all duration-300 ease-in-out",
          "hover:pr-5 hover:shadow-xl",
          "group"
        )}
      >
        <ChevronLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
        <span className={cn(
          "max-w-0 overflow-hidden opacity-0 whitespace-nowrap font-semibold",
          "transition-all duration-300 ease-in-out",
          "group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2"
        )}>
          View Dashboard
        </span>
      </Link>
    </div>
  );
}
