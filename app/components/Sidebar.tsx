'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Promo Code System</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="mt-6">
        <Link
          href="/dashboard"
          className={`block px-6 py-3 text-sm font-medium transition-colors ${
            isActive('/dashboard') 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Promo Codes
        </Link>
        <Link
          href="/dashboard/agencies"
          className={`block px-6 py-3 text-sm font-medium transition-colors ${
            isActive('/dashboard/agencies') 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Agencies
        </Link>
        <Link
          href="/dashboard/reports"
          className={`block px-6 py-3 text-sm font-medium transition-colors ${
            isActive('/dashboard/reports') 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Reports
        </Link>
      </nav>

      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            Current User: <span className="text-white font-medium">Admin</span>
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
            className="mt-2 w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}