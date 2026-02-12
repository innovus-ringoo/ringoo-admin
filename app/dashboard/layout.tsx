import TopNavigation from '../components/TopNavigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has admin role
  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}

