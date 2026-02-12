'use client';

import TopNavigation from './TopNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  actionButton?: React.ReactNode;
}

export default function DashboardLayout({ 
  children, 
  title, 
  actionButton 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      <div className="max-w-[800px] mx-auto px-4 py-6">
        {title && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {actionButton}
          </div>
        )}
        <div className="border border-gray-100 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
