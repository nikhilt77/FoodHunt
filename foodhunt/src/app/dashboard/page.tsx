'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, 
  ShoppingCart, 
  History, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Redirect admins to admin panel
    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }

    // Refresh user data to get latest dues information
    const refreshUserData = async () => {
      try {
        setRefreshing(true);
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      } finally {
        setRefreshing(false);
      }
    };

    refreshUserData();
  }, [user?.email, router]); // Use user?.email to avoid infinite loop

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleMenuClick = (href: string, label: string) => {
    // Navigate to actual pages for implemented features
    if (href === '/admin' && user.role === 'admin') {
      router.push('/admin');
    } else if (href === '/dashboard/order') {
      router.push('/menu');
    } else if (href === '/dashboard/orders') {
      router.push('/menu'); // Will show orders tab
    } else if (href === '/dashboard/wallet') {
      router.push('/wallet');
    } else {
      // For unimplemented features, show alert
      alert(`${label} functionality coming soon!\n\nYou clicked: ${href}\nRole: ${user.role}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const menuItems = [
    { icon: ShoppingCart, label: 'Order Food', href: '/dashboard/order', description: 'Browse menu and place orders' },
    { icon: History, label: 'Order History', href: '/dashboard/orders', description: 'View your past orders' },
    { icon: CreditCard, label: 'Wallet', href: '/dashboard/wallet', description: 'Manage your balance' },
    { icon: User, label: 'Profile', href: '/dashboard/profile', description: 'Update your information' }
  ];

  const getRoleWelcomeMessage = () => {
    switch (user.role) {
      case 'admin':
        return 'Welcome back, Administrator! You have full system access.';
      case 'staff':
        return 'Welcome back, Staff member! Manage orders and help students.';
      case 'student':
        return 'Welcome back, Student! Ready to order some delicious food?';
      default:
        return 'Welcome to FoodHunt!';
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-2">FoodHunt</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              {user.role !== 'admin' && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.totalDues > 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.totalDues > 0 ? `Dues: ₹${user.totalDues.toFixed(2)}` : 'No Dues'}
                </div>
              )}
              {user.role === 'admin' && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Administrator
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            </div>
            <nav className="mt-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    handleMenuClick(item.href, item.label);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="mt-2 text-gray-600">{getRoleWelcomeMessage()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                {user.role.toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <CreditCard className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Dues</p>
                <p className="text-2xl font-bold text-gray-900">₹{user.totalDues?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingCart className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Orders This Month</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.href, item.label)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block group w-full text-left"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <item.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">{item.label}</h3>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Recent activity placeholder */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start by placing your first order!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
