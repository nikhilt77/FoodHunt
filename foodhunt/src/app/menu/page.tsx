'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ShoppingCart,
  Clock,
  AlertTriangle,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Plus,
  Minus
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
}

interface Reservation {
  _id: string;
  foodItemId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  reservationDate: string;
  preferredPickupTime: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  foodItem: {
    name: string;
    description: string;
    price: number;
    category: string;
  };
}

interface DuesSummary {
  totalDues: number;
  pendingPayments: number;
  overduePayments: number;
  nextDueDate: string | null;
}

export default function MenuPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('menu');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [duesSummary, setDuesSummary] = useState<DuesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [menuRes, reservationsRes, duesRes] = await Promise.all([
        api.get('/food'),
        api.get('/reservations/my'),
        api.get('/dues/summary')
      ]);
      
      setFoodItems(menuRes.data);
      setReservations(reservationsRes.data.reservations);
      setDuesSummary(duesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeReservation = async (foodItemId: string, quantity: number) => {
    try {
      const preferredPickupTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins from now
      
      await api.post('/reservations', {
        foodItemId,
        quantity,
        preferredPickupTime,
        notes: ''
      });
      
      alert(`Reservation successful! Your food will be ready in 30 minutes.`);
      fetchData(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error making reservation');
    }
  };

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'beverages'];
  const filteredItems = selectedCategory === 'all' 
    ? foodItems 
    : foodItems.filter(item => item.category === selectedCategory);

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!user) {
    return <div>Please login to access this page</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Canteen Menu</h1>
              <p className="text-gray-600">Reserve your favorite food</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Dues Alert */}
      {duesSummary && duesSummary.totalDues > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-600 mr-3" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800">
                  <span className="font-semibold">Total Dues: ₹{duesSummary.totalDues}</span>
                  {duesSummary.overduePayments > 0 && (
                    <span className="ml-2 text-red-600">({duesSummary.overduePayments} overdue payments)</span>
                  )}
                  {duesSummary.nextDueDate && (
                    <span className="ml-2">
                      Next due: {getDaysUntilDue(duesSummary.nextDueDate)} days
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Orders ({reservations.length})
            </button>
          </nav>
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="mt-6">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <FoodItemCard 
                  key={item._id} 
                  item={item} 
                  onReserve={makeReservation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
            
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start by reserving some delicious food!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.foodItem.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{reservation.foodItem.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Package size={16} className="mr-1" />
                          Quantity: {reservation.quantity}
                          <span className="mx-2">•</span>
                          <span className="font-semibold">₹{reservation.totalAmount}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Clock size={16} className="mr-1" />
                          Pickup: {new Date(reservation.preferredPickupTime).toLocaleString()}
                        </div>
                        {reservation.paymentStatus === 'pending' && (
                          <div className="mt-1 flex items-center text-sm text-orange-600">
                            <AlertTriangle size={16} className="mr-1" />
                            Due: {new Date(reservation.dueDate).toLocaleDateString()} 
                            ({getDaysUntilDue(reservation.dueDate)} days left)
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reservation.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status.toUpperCase()}
                        </span>
                        <span className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                          reservation.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                          reservation.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reservation.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Food Item Card Component
function FoodItemCard({ item, onReserve }: { item: FoodItem, onReserve: (id: string, qty: number) => void }) {
  const [quantity, setQuantity] = useState(1);

  const getStockColor = () => {
    const percentage = (item.stock / item.maxDailyStock) * 100;
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
        </div>
        <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
      
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex items-center text-gray-500">
          <Clock size={16} className="mr-1" />
          {item.preparationTime} mins
        </div>
        <div className={`flex items-center ${getStockColor()}`}>
          <Package size={16} className="mr-1" />
          {item.stock} left
        </div>
      </div>

      {item.isAvailable && item.stock > 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center border-2 border-gray-400 rounded-lg bg-gray-50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-200 text-gray-700"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-2 min-w-[50px] text-center font-semibold text-gray-900 bg-white">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
              className="p-2 hover:bg-gray-200 text-gray-700"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button
            onClick={() => onReserve(item._id, quantity)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Reserve
          </button>
        </div>
      ) : (
        <div className="text-center py-2">
          <span className="text-red-600 text-sm font-medium">
            {!item.isAvailable ? 'Not Available' : 'Out of Stock'}
          </span>
        </div>
      )}
    </div>
  );
}
