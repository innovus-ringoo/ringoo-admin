'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function TopNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/login'
    });
  };

  return (
    <nav className="bg-primary border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo-white-PNG.png"
                alt="Promo Code System"
                width={120}
                height={30}
                className="h-7 w-auto"
              />
            </Link>

            {/* Navigation Links */}

          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>  <div className="flex gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-2 transition-colors ${isActive('/dashboard') && !isActive('/dashboard/agencies') && !isActive('/dashboard/reports') && !isActive('/dashboard/users') && !isActive('/dashboard/offers')
              ? 'bg-white text-primary'
              : 'text-white hover:text-[#2A93FF] hover:bg-white'
              }`}
          >
            Promo Codes
          </Link>
          <Link
            href="/dashboard/offers"
            className={`px-3 py-2 transition-colors ${isActive('/dashboard/offers')
              ? 'bg-white text-primary'
              : 'text-white hover:text-[#2A93FF] hover:bg-white'
              }`}
          >
            Offers
          </Link>
          <Link
            href="/dashboard/agencies"
            className={`px-3 py-2 transition-colors ${isActive('/dashboard/agencies')
              ? 'bg-white text-primary'
              : 'text-white hover:text-[#2A93FF] hover:bg-white'
              }`}
          >
            Agencies
          </Link>    <Link
            href="/dashboard/users"
            className={`px-3 py-2 transition-colors ${isActive('/dashboard/users')
              ? 'bg-white text-primary'
              : 'text-white hover:text-[#2A93FF] hover:bg-white'
              }`}
          >
            Users
          </Link>
          <Link
            href="/dashboard/reports"
            className={`px-3 py-2 transition-colors ${isActive('/dashboard/reports')
              ? 'bg-white text-primary'
              : 'text-white hover:text-[#2A93FF] hover:bg-white'
              }`}
          >
            Reports
          </Link>

        </div>
      </div>
    </nav>
  );
}
