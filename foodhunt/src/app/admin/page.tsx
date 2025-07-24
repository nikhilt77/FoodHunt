'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Plus,
  Package,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Eye,
  ArrowLeft,
  Home,
  Settings,
  Users,
  BarChart3,
  Coffee,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  AlertTriangle,
  Star,
  Calendar,
  MapPin,
  LogOut
} from 'lucide-react';
import api from '@/lib/api';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  stock: number;
  maxDailyStock: number;
  nutritionalInfo?: any;
}

interface Reservation {
  _id: string;
  userId: string;
  foodItemId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  reservationDate: string;
  preferredPickupTime: string;
  user: {
    name: string;
    studentId: string;
    department: string;
  };
  foodItem: {
    name: string;
    category: string;
  };
}

interface NewFoodItem {
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  maxDailyStock: number;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [studentsWithDues, setStudentsWithDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [itemsNeedingMigration, setItemsNeedingMigration] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<NewFoodItem>({
    name: '',
    description: '',
    price: 0,
    category: 'breakfast',
    preparationTime: 15,
    maxDailyStock: 50
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch menu data
      try {
        const menuRes = await api.get('/food');
        console.log('Menu response:', menuRes.data);
        console.log('Food items to set:', menuRes.data.data || menuRes.data);
        let items = menuRes.data.data || menuRes.data;
        
        // Normalize items to ensure all have stock and maxDailyStock properties
        items = items.map((item: any) => ({
          ...item,
          stock: (item.stock !== undefined && item.stock !== null) ? item.stock : 0,
          maxDailyStock: (item.maxDailyStock !== undefined && item.maxDailyStock !== null) ? item.maxDailyStock : 50
        }));
        
        console.log('Setting food items:', items.length, 'items');
        console.log('First item stock example:', items[0]?.name, 'stock:', items[0]?.stock);
        
        // Find items that need stock properties added to backend
        const originalApiItems = menuRes.data.data || menuRes.data;
        const itemsNeedingStockUpdate = originalApiItems.filter((item: any) => 
          item.stock === undefined || item.stock === null || 
          item.maxDailyStock === undefined || item.maxDailyStock === null
        );
        
        if (itemsNeedingStockUpdate.length > 0 && !migrationCompleted) {
          console.log('Found', itemsNeedingStockUpdate.length, 'items needing stock properties:', itemsNeedingStockUpdate.map((i: any) => i.name));
          setItemsNeedingMigration(itemsNeedingStockUpdate);
          setMigrationCompleted(true); // Prevent infinite loops
          
          // Auto-fix items without stock properties
          let migrationSuccessful = true;
          for (const item of itemsNeedingStockUpdate) {
            try {
              console.log('Adding stock properties to:', item.name);
              const response = await api.put(`/food/${item._id}`, {
                stock: 0,
                maxDailyStock: 50
              });
              console.log('✅ Backend response for', item.name, ':', response.data);
            } catch (error: any) {
              console.error('❌ Failed to add stock properties to item:', item.name, error.response?.data || error.message);
              migrationSuccessful = false;
              
              // If it's an auth error, don't continue with other items
              if (error.response?.status === 401 || error.response?.status === 403) {
                console.error('❌ Authentication failed during migration. Stopping auto-migration.');
                break;
              }
            }
          }
          
          if (migrationSuccessful) {
            // Re-fetch data after auto-migration to get updated values
            console.log('🔄 Re-fetching data after auto-migration...');
            const updatedRes = await api.get('/food');
            console.log('🔄 Updated API response:', updatedRes.data);
            items = updatedRes.data.data || updatedRes.data;
            
            // Log the first item to see if stock properties are now present
            if (items.length > 0) {
              console.log('🔍 First item after migration:', {
                name: items[0].name,
                stock: items[0].stock,
                maxDailyStock: items[0].maxDailyStock,
                hasStock: items[0].hasOwnProperty('stock'),
                hasMaxStock: items[0].hasOwnProperty('maxDailyStock')
              });
            }
            
            items = items.map((item: any) => ({
              ...item,
              stock: (item.stock !== undefined && item.stock !== null) ? item.stock : 0,
              maxDailyStock: (item.maxDailyStock !== undefined && item.maxDailyStock !== null) ? item.maxDailyStock : 50
            }));
          } else {
            console.warn('⚠️ Auto-migration failed. Using frontend normalization only.');
            // Don't re-fetch if migration failed, just use normalized data
          }
        }
        
        setFoodItems(items);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
      
      // Fetch reservations data - temporarily disabled until admin routes are fixed
      try {
        // const reservationsRes = await api.get('/admin/reservations');
        // setReservations(reservationsRes.data.reservations);
        setReservations([]); // Empty for now
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      }
      
      // Fetch dues data - temporarily disabled until admin routes are fixed
      try {
        // const duesRes = await api.get('/admin/students/dues');
        // setStudentsWithDues(duesRes.data.data || []);
        setStudentsWithDues([]); // Empty for now
      } catch (error) {
        console.error('Error fetching dues:', error);
        setStudentsWithDues([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const markDuesAsPaid = async (studentId: string, orderIds?: string[]) => {
    try {
      const endpoint = orderIds ? 
        `/admin/students/${studentId}/mark-paid` : 
        `/admin/students/${studentId}/mark-all-paid`;
      
      const payload = orderIds ? { orderIds, paymentMethod: 'cash' } : { paymentMethod: 'cash' };
      
      await api.post(endpoint, payload);
      
      // Refresh the dues data
      const duesRes = await api.get('/admin/students/dues');
      setStudentsWithDues(duesRes.data.data || []);
      
      alert(orderIds ? 'Selected orders marked as paid!' : 'All dues marked as paid!');
    } catch (error) {
      console.error('Error marking dues as paid:', error);
      alert('Failed to mark dues as paid. Please try again.');
    }
  };

  const addNewItem = async () => {
    try {
      // Enhanced validation to match backend requirements
      if (!newItem.name || newItem.name.trim().length < 2) {
        alert('Item name must be at least 2 characters long');
        return;
      }

      if (!newItem.description || newItem.description.trim().length < 10) {
        alert('Description must be at least 10 characters long');
        return;
      }

      if (!newItem.price || newItem.price <= 0) {
        alert('Price must be a positive number');
        return;
      }

      if (!newItem.preparationTime || newItem.preparationTime < 1) {
        alert('Preparation time must be at least 1 minute');
        return;
      }

      if (!newItem.maxDailyStock || newItem.maxDailyStock < 1) {
        alert('Daily stock limit must be at least 1');
        return;
      }

      console.log('Sending data to backend:', {
        ...newItem,
        stock: newItem.maxDailyStock
      });

      const response = await api.post('/food', {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: Number(newItem.price),
        category: newItem.category,
        preparationTime: Number(newItem.preparationTime),
        maxDailyStock: Number(newItem.maxDailyStock),
        stock: Number(newItem.maxDailyStock) // Start with full stock
      });
      
      console.log('Item created successfully:', response.data);
      
      // Reset form
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'breakfast',
        preparationTime: 15,
        maxDailyStock: 50
      });
      
      setShowAddItem(false);
      fetchData(); // Refresh data
      alert('Item added successfully!');
    } catch (error: any) {
      console.error('Error adding item:', error);
      
      // Better error handling
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.errors 
          ? error.response.data.errors.map((e: any) => e.msg).join(', ')
          : error.response.data?.message || 'Validation error';
        alert(`Validation failed: ${errorMsg}`);
      } else if (error.response?.status === 401) {
        alert('Authentication required. Please log in again.');
      } else {
        alert('Failed to add item. Please try again.');
      }
    }
  };

  const fixItemsWithoutStock = async () => {
    if (itemsNeedingMigration.length === 0) {
      alert('No items need stock properties to be added.');
      return;
    }

    try {
      console.log('🔧 Starting manual migration for', itemsNeedingMigration.length, 'items...');
      let successCount = 0;
      
      for (const item of itemsNeedingMigration) {
        try {
          console.log('🔧 Adding stock properties to:', item.name);
          const response = await api.put(`/food/${item._id}`, {
            stock: 0,
            maxDailyStock: 50
          });
          console.log('✅ Success for', item.name, ':', response.data);
          successCount++;
        } catch (error: any) {
          console.error('❌ Failed to fix', item.name, ':', error.response?.data || error.message);
        }
      }
      
      if (successCount > 0) {
        alert(`Successfully added stock properties to ${successCount} out of ${itemsNeedingMigration.length} items.`);
        setItemsNeedingMigration([]);
        fetchData(); // Refresh data
      } else {
        alert('Failed to add stock properties to any items. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Manual migration failed:', error);
      alert('Migration failed. Please check console for details.');
    }
  };

  const updateStock = async (itemId: string, stock: number) => {
    try {
      console.log('🔄 Starting stock update...');
      console.log('📋 Item ID:', itemId);
      console.log('📊 New Stock:', stock);
      
      // Find the current item to check its availability status
      const currentItem = foodItems.find(item => item._id === itemId);
      
      if (!currentItem) {
        console.error('❌ Item not found:', itemId);
        alert('Error: Item not found. Please refresh the page and try again.');
        return;
      }

      console.log('✅ Current item found:', currentItem.name);
        console.log('📦 Current stock:', currentItem.stock || 0, '→ New stock:', stock);      // Auto-update availability based on stock level
      const updateData: any = { stock };
      
      if (stock === 0) {
        // Automatically set to unavailable when out of stock
        updateData.isAvailable = false;
        console.log('🔴 Setting item unavailable (stock = 0)');
        } else if (stock > 0 && currentItem && (currentItem.stock || 0) === 0) {
          // Only auto-enable if the item was previously at zero stock
          // This preserves manual admin decisions to disable items with stock
          updateData.isAvailable = true;
          console.log('🟢 Setting item available (restocking from 0)');
        }      console.log('📤 Sending update data:', updateData);
      console.log('🔗 API URL:', `/food/${itemId}`);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('🔑 Auth token present:', !!token);
      
      // Update the API
      console.log('⏳ Making API call...');
      const response = await api.put(`/food/${itemId}`, updateData);
      console.log('✅ API response:', response.data);
      console.log('✅ API status:', response.status);
      
      // Immediately update local state for instant feedback
      console.log('🔄 Updating local state...');
      console.log('🔄 Before state update - current item:', currentItem.name, 'stock:', currentItem.stock);
      console.log('🔄 New values to set - stock:', stock, 'isAvailable:', updateData.isAvailable ?? currentItem.isAvailable);
      
      setFoodItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item._id === itemId 
            ? { ...item, stock, isAvailable: updateData.isAvailable ?? item.isAvailable }
            : item
        );
        console.log('🔄 Updated item in state:', updatedItems.find(item => item._id === itemId));
        return updatedItems;
      });
      
      // Force re-render
      setRenderKey(prev => prev + 1);      // Also refresh from server to ensure consistency
      console.log('🔄 Refreshing data from server...');
      fetchData();
      
      // Show feedback to admin
      if (stock === 0) {
        console.log('ℹ️ Item automatically set to unavailable due to zero stock');
      } else if (updateData.isAvailable === true) {
        console.log('ℹ️ Item automatically set to available due to stock replenishment');
      }
      
      console.log('✅ Stock update completed successfully!');
    } catch (error: any) {
      console.error('❌ Error updating stock:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      
      // Show specific error messages
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
        // Force logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      } else if (error.response?.status === 403) {
        alert('Access denied. You do not have permission to update items.');
      } else if (error.response?.status === 404) {
        alert('Item not found. Please refresh the page and try again.');
      } else {
        alert(`Failed to update stock: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
      
      // Reset the input field on error
      const input = document.getElementById(`stock-${itemId}`) as HTMLInputElement;
      const currentItem = foodItems.find(item => item._id === itemId);
      if (input && currentItem) {
        console.log('🔄 Resetting input field to original value:', currentItem.stock || 0);
        input.value = (currentItem.stock || 0).toString();
      }
    }
  };

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      // Find the current item to check stock level
      const currentItem = foodItems.find(item => item._id === itemId);
      
                      // Prevent enabling items with zero stock
                      if (isAvailable && currentItem && (currentItem.stock || 0) === 0) {
                        alert('Cannot enable item with zero stock. Please add stock first.');
                        return;
                      }      await api.put(`/food/${itemId}`, { isAvailable });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: string) => {
    try {
      // TODO: Replace with working admin endpoint when available
      console.log('Reservation status update not yet implemented:', reservationId, status);
      alert('Reservation status update feature will be available once admin routes are fixed');
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const getStockStatusColor = (stock: number, maxStock: number) => {
    const percentage = (stock / maxStock) * 100;
    if (percentage <= 20) return 'text-red-600 bg-red-100';
    if (percentage <= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // Calculate summary statistics
  const totalOrders = reservations.length;
  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const pendingOrders = reservations.filter(r => r.status === 'pending').length;
  const completedOrders = reservations.filter(r => r.status === 'completed').length;
  const readyOrders = reservations.filter(r => r.status === 'ready').length;

  // Filter functions
  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = foodItems.filter(item => {
    const percentage = ((item.stock || 0) / (item.maxDailyStock || 50)) * 100;
    return percentage <= 20;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <Coffee className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">FoodHunt Admin</h1>
                <p className="text-blue-100">Welcome back! Here's what's happening today</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/auth/login');
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-8">
          <nav className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
              { id: 'menu', label: 'Menu Management', icon: Coffee },
              { id: 'orders', label: 'Orders & Kitchen', icon: ShoppingBag },
              { id: 'dues', label: 'Student Dues', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Alert for Low Stock */}
            {lowStockItems.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-amber-800">Low Stock Alert!</h3>
                    <p className="text-amber-700">
                      {lowStockItems.length} item(s) are running low on stock and need attention.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="ml-auto bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    View Items
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Orders Today</p>
                    <p className="text-4xl font-bold mt-2">{totalOrders}</p>
                    <p className="text-blue-100 text-sm mt-1">
                      {totalOrders > 0 ? '+' + Math.round((totalOrders / 10) * 100) : '0'}% from yesterday
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
                    <p className="text-4xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-green-100 text-sm mt-1">
                      Avg: ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0} per order
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Orders in Kitchen</p>
                    <p className="text-4xl font-bold mt-2">{pendingOrders + readyOrders}</p>
                    <p className="text-yellow-100 text-sm mt-1">
                      Pending: {pendingOrders} | Ready: {readyOrders}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Completed Orders</p>
                    <p className="text-4xl font-bold mt-2">{completedOrders}</p>
                    <p className="text-purple-100 text-sm mt-1">
                      Success Rate: {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    Add New Item
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <Eye className="h-6 w-6 mx-auto mb-2" />
                    View Orders
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-6 w-6 mx-auto mb-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Updating...' : 'Refresh Data'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <Settings className="h-6 w-6 mx-auto mb-2" />
                    Settings
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                  Today's Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Completion Rate</span>
                    <span className="font-semibold text-green-600">
                      {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kitchen Efficiency</span>
                    <span className="font-semibold text-blue-600">
                      {totalOrders > 0 ? Math.round(((completedOrders + readyOrders) / totalOrders) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${totalOrders > 0 ? ((completedOrders + readyOrders) / totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 text-blue-500 mr-2" />
                Recent Orders
              </h3>
              <div className="space-y-4">
                {reservations.slice(0, 5).map((reservation) => (
                  <div key={reservation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        reservation.status === 'pending' ? 'bg-yellow-400' :
                        reservation.status === 'ready' ? 'bg-blue-400' :
                        reservation.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.user.name} - {reservation.foodItem.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {reservation.quantity} | Amount: ₹{reservation.totalAmount}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(reservation.preferredPickupTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Migration Alert */}
            {itemsNeedingMigration.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-orange-800">Items Need Stock Properties</h3>
                    <p className="text-orange-700">
                      {itemsNeedingMigration.length} item(s) are missing stock management properties: {itemsNeedingMigration.map(i => i.name).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={fixItemsWithoutStock}
                    className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    Fix Items
                  </button>
                </div>
              </div>
            )}

            {/* Header with Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Coffee className="h-8 w-8 text-blue-600 mr-3" />
                    Menu Management
                  </h2>
                  <p className="text-gray-600">Manage your food items, stock, and availability</p>
                </div>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Item</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Categories</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Add Item Modal */}
            {showAddItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Plus className="h-6 w-6 text-blue-600 mr-2" />
                      Add New Menu Item
                    </h3>
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="e.g. Butter Chicken (minimum 2 characters)"
                        />
                        {newItem.name && newItem.name.trim().length < 2 && (
                          <p className="text-red-500 text-xs mt-1">Name must be at least 2 characters</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          rows={3}
                          placeholder="Describe the dish, ingredients, and special features... (minimum 10 characters)"
                        />
                        {newItem.description && newItem.description.trim().length < 10 && (
                          <p className="text-red-500 text-xs mt-1">Description must be at least 10 characters</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">{newItem.description.length}/10 characters minimum</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          min="1"
                          step="1"
                          placeholder="Enter price (minimum ₹1)"
                        />
                        {newItem.price <= 0 && (
                          <p className="text-red-500 text-xs mt-1">Price must be greater than 0</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="breakfast">🌅 Breakfast</option>
                          <option value="lunch">🍽️ Lunch</option>
                          <option value="dinner">🌙 Dinner</option>
                          <option value="snacks">🍿 Snacks</option>
                          <option value="beverages">☕ Beverages</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preparation Time (minutes)
                        </label>
                        <input
                          type="number"
                          value={newItem.preparationTime}
                          onChange={(e) => setNewItem({...newItem, preparationTime: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          min="1"
                          placeholder="Minimum 1 minute"
                        />
                        {newItem.preparationTime < 1 && (
                          <p className="text-red-500 text-xs mt-1">Preparation time must be at least 1 minute</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Daily Stock Limit
                        </label>
                        <input
                          type="number"
                          value={newItem.maxDailyStock}
                          onChange={(e) => setNewItem({...newItem, maxDailyStock: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          min="1"
                          placeholder="Minimum 1 item"
                        />
                        {newItem.maxDailyStock < 1 && (
                          <p className="text-red-500 text-xs mt-1">Stock limit must be at least 1</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewItem}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg transition-all"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            <div key={renderKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">₹{item.price}</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>
                  
                  {/* Stock Management */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Stock Level</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStockStatusColor(item.stock || 0, item.maxDailyStock || 50)}`}>
                          {item.stock || 0}/{item.maxDailyStock || 50}
                        </span>
                      </div>
                      
                      {/* Stock Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (item.stock || 0) === 0 ? 'bg-red-500' :
                            ((item.stock || 0) / (item.maxDailyStock || 50)) <= 0.2 ? 'bg-red-500' :
                            ((item.stock || 0) / (item.maxDailyStock || 50)) <= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${((item.stock || 0) / (item.maxDailyStock || 50)) * 100}%`,
                            minWidth: (item.stock || 0) > 0 ? '3px' : '0px'
                          }}
                        ></div>
                      </div>
                      
                      {/* Stock Input */}
                      <div className="flex items-stretch space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={item.maxDailyStock || 50}
                          key={`${item._id}-${item.stock || 0}`} // Force re-render when stock changes
                          defaultValue={item.stock || 0}
                          id={`stock-${item._id}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const newStock = parseInt(input.value);
                              if (newStock !== (item.stock || 0) && newStock >= 0) {
                                updateStock(item._id, newStock);
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`stock-${item._id}`) as HTMLInputElement;
                            const newStock = parseInt(input.value);
                            if (newStock !== (item.stock || 0) && newStock >= 0 && newStock <= (item.maxDailyStock || 50)) {
                              updateStock(item._id, newStock);
                            } else if (newStock > (item.maxDailyStock || 50)) {
                              alert(`Stock cannot exceed maximum daily limit of ${item.maxDailyStock || 50}`);
                              input.value = (item.stock || 0).toString();
                            } else if (newStock < 0) {
                              alert('Stock cannot be negative');
                              input.value = (item.stock || 0).toString();
                            }
                          }}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => updateStock(item._id, item.maxDailyStock || 50)}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-700">Available to Order</span>
                        {item.isAvailable && (
                          <span className="text-xs text-green-600 font-medium">(Active)</span>
                        )}
                        {!item.isAvailable && (item.stock || 0) === 0 && (
                          <span className="text-xs text-red-600 font-medium">(Out of Stock)</span>
                        )}
                        {!item.isAvailable && (item.stock || 0) > 0 && (
                          <span className="text-xs text-amber-600 font-medium">(Manually Disabled)</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleAvailability(item._id, !item.isAvailable)}
                        disabled={(item.stock || 0) === 0 && !item.isAvailable}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                        } ${(item.stock || 0) === 0 && !item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={(item.stock || 0) === 0 && !item.isAvailable ? 'Increase stock to enable availability' : ''}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Stock Status Message */}
                    {(item.stock || 0) === 0 && !item.isAvailable && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-xs">
                          Item automatically disabled due to zero stock. Add stock to re-enable.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredFoodItems.length === 0 && (
              <div className="text-center py-12">
                <Coffee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by adding your first menu item'
                  }
                </p>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  Add First Item
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Kitchen Dashboard Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <ShoppingBag className="h-8 w-8 text-green-600 mr-3" />
                    Kitchen Dashboard
                  </h2>
                  <p className="text-gray-600">Manage orders and track kitchen operations</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{readyOrders}</div>
                    <div className="text-sm text-gray-500">Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Orders */}
              <div className="bg-white rounded-2xl shadow-sm border-l-4 border-yellow-400">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      Pending Orders
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {pendingOrders}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reservations
                      .filter(r => r.status === 'pending')
                      .map((reservation) => (
                        <div key={reservation._id} className="p-4 bg-yellow-50 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{reservation.foodItem.name}</p>
                              <p className="text-sm text-gray-600">
                                {reservation.user.name} • Qty: {reservation.quantity}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-yellow-600">
                              ₹{reservation.totalAmount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              Pickup: {new Date(reservation.preferredPickupTime).toLocaleTimeString()}
                            </p>
                            <button
                              onClick={() => updateReservationStatus(reservation._id, 'ready')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark Ready
                            </button>
                          </div>
                        </div>
                      ))}
                    {reservations.filter(r => r.status === 'pending').length === 0 && (
                      <div className="text-center py-6">
                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No pending orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready Orders */}
              <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-400">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                      Ready for Pickup
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {readyOrders}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reservations
                      .filter(r => r.status === 'ready')
                      .map((reservation) => (
                        <div key={reservation._id} className="p-4 bg-blue-50 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{reservation.foodItem.name}</p>
                              <p className="text-sm text-gray-600">
                                {reservation.user.name} • ID: {reservation.user.studentId}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                              ₹{reservation.totalAmount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              Qty: {reservation.quantity}
                            </p>
                            <button
                              onClick={() => updateReservationStatus(reservation._id, 'completed')}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      ))}
                    {reservations.filter(r => r.status === 'ready').length === 0 && (
                      <div className="text-center py-6">
                        <CheckCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No orders ready</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Completed Orders */}
              <div className="bg-white rounded-2xl shadow-sm border-l-4 border-green-400">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Star className="h-5 w-5 text-green-500 mr-2" />
                      Completed Today
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {completedOrders}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reservations
                      .filter(r => r.status === 'completed')
                      .slice(0, 10)
                      .map((reservation) => (
                        <div key={reservation._id} className="p-4 bg-green-50 rounded-xl">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{reservation.foodItem.name}</p>
                              <p className="text-sm text-gray-600">
                                {reservation.user.name} • ₹{reservation.totalAmount}
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    {reservations.filter(r => r.status === 'completed').length === 0 && (
                      <div className="text-center py-6">
                        <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No completed orders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* All Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-6 w-6 text-purple-500 mr-2" />
                    All Orders Today
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Total Revenue: <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reservation.user.name}</div>
                            <div className="text-sm text-gray-500">{reservation.user.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{reservation.foodItem.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{reservation.foodItem.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reservation.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{reservation.totalAmount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(reservation.preferredPickupTime).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {reservation.status === 'pending' && (
                              <button
                                onClick={() => updateReservationStatus(reservation._id, 'ready')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Mark Ready
                              </button>
                            )}
                            {reservation.status === 'ready' && (
                              <button
                                onClick={() => updateReservationStatus(reservation._id, 'completed')}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {reservations.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet today</h3>
                    <p className="text-gray-500">Orders will appear here as customers place them</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Student Dues Tab */}
        {activeTab === 'dues' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                    Student Dues Management
                  </h2>
                  <p className="text-gray-600">Track and manage outstanding student payments</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Students with Dues</div>
                  <div className="text-3xl font-bold text-red-600">{studentsWithDues.length}</div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Outstanding</p>
                    <p className="text-4xl font-bold mt-2">
                      ₹{studentsWithDues.reduce((sum, student) => sum + (student.totalDues || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-red-100 text-sm mt-1">Across {studentsWithDues.length} students</p>
                  </div>
                  <AlertTriangle className="h-12 w-12" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending Orders</p>
                    <p className="text-4xl font-bold mt-2">
                      {studentsWithDues.reduce((sum, student) => sum + (student.pendingOrders?.length || 0), 0)}
                    </p>
                    <p className="text-yellow-100 text-sm mt-1">Unpaid orders</p>
                  </div>
                  <Clock className="h-12 w-12" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Average Due</p>
                    <p className="text-4xl font-bold mt-2">
                      ₹{studentsWithDues.length > 0 ? 
                        Math.round(studentsWithDues.reduce((sum, student) => sum + (student.totalDues || 0), 0) / studentsWithDues.length) : 0}
                    </p>
                    <p className="text-blue-100 text-sm mt-1">Per student</p>
                  </div>
                  <Users className="h-12 w-12" />
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Students with Outstanding Dues</h3>
              </div>
              
              <div className="overflow-x-auto">
                {studentsWithDues.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentsWithDues.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.department || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {student.pendingOrders?.length || 0} orders
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-red-600">₹{student.totalDues?.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => markDuesAsPaid(student._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Mark All Paid
                            </button>
                            <button
                              onClick={() => {
                                // Show detailed view in a modal (could be implemented)
                                alert(`Detailed view for ${student.name} - Feature coming soon!`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Outstanding Dues!</h3>
                    <p className="text-gray-500">All students have paid their orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
