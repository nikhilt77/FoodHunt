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
  ArrowLeft
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
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
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
      const menuRes = await api.get('/food');
      setFoodItems(menuRes.data);
      
      // For now, set empty reservations since the admin endpoint isn't working
      // You can replace this with actual reservations data when the backend is fixed
      setReservations([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = async () => {
    try {
      if (!newItem.name || !newItem.description || newItem.price <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      await api.post('/food', {
        ...newItem,
        stock: newItem.maxDailyStock // Start with full stock
      });
      
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
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const updateStock = async (itemId: string, stock: number) => {
    try {
      await api.put(`/food/${itemId}`, { stock });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await api.put(`/food/${itemId}`, { isAvailable });
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

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage FoodHunt operations</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🍽️ Menu Management
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Orders & Reservations
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add New Menu Item
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Eye size={20} className="mr-2" />
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Food Menu Management</h2>
              <button
                onClick={() => setShowAddItem(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add New Item
              </button>
            </div>

            {/* Add Item Modal */}
            {showAddItem && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Menu Item</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter food item name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description *</label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={3}
                        placeholder="Describe the food item"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
                        <input
                          type="number"
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snacks">Snacks</option>
                          <option value="beverages">Beverages</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prep Time (min)</label>
                        <input
                          type="number"
                          value={newItem.preparationTime}
                          onChange={(e) => setNewItem({...newItem, preparationTime: Number(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          min="5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Stock</label>
                        <input
                          type="number"
                          value={newItem.maxDailyStock}
                          onChange={(e) => setNewItem({...newItem, maxDailyStock: Number(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  {/* Stock Status */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Stock</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusColor(item.stock, item.maxDailyStock)}`}>
                        {item.stock}/{item.maxDailyStock}
                      </span>
                    </div>
                    
                    {/* Stock Update */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={item.maxDailyStock}
                        defaultValue={item.stock}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={(e) => {
                          const newStock = parseInt(e.target.value);
                          if (newStock !== item.stock && newStock >= 0) {
                            updateStock(item._id, newStock);
                          }
                        }}
                      />
                      <Package size={16} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Available</span>
                    <button
                      onClick={() => toggleAvailability(item._id, !item.isAvailable)}
                      className={`p-1 rounded ${
                        item.isAvailable 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {item.isAvailable ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="mt-6">
            {!showReservationDetails ? (
              // Summary View
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Orders & Reservations Summary</h2>
                  <button
                    onClick={() => setShowReservationDetails(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Eye size={20} className="mr-2" />
                    View All Details
                  </button>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders Today</p>
                        <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Pending: {pendingOrders} | Completed: {completedOrders}
                        </p>
                      </div>
                      <ShoppingBag className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">₹{totalRevenue}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Average: ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0} per order
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Order Status</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-semibold text-yellow-600">{pendingOrders}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ready</span>
                            <span className="font-semibold text-blue-600">
                              {reservations.filter(r => r.status === 'ready').length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Completed</span>
                            <span className="font-semibold text-green-600">{completedOrders}</span>
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="h-12 w-12 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reservation.user.name} - {reservation.foodItem.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {reservation.quantity} | ₹{reservation.totalAmount}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Detailed View
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Order Details</h2>
                  <button
                    onClick={() => setShowReservationDetails(false)}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Summary
                  </button>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <li key={reservation._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {reservation.user.name} ({reservation.user.studentId})
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  reservation.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                  reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {reservation.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    {reservation.foodItem.name} × {reservation.quantity}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <Clock size={16} className="mr-1" />
                                    {new Date(reservation.preferredPickupTime).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <span className="font-semibold">₹{reservation.totalAmount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="ml-4 flex space-x-2">
                            {reservation.status === 'pending' && (
                              <button
                                onClick={() => updateReservationStatus(reservation._id, 'ready')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Mark Ready
                              </button>
                            )}
                            {reservation.status === 'ready' && (
                              <button
                                onClick={() => updateReservationStatus(reservation._id, 'completed')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
