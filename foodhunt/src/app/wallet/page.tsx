'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  History, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Receipt,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';

interface Payment {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  orderId?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: Array<{
    foodItemId: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export default function WalletPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '' });
  const [totalDues, setTotalDues] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }

    fetchWalletData();
  }, [user, router]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment history
      const paymentsRes = await api.get('/auth/payments');
      setPayments(paymentsRes.data.data || []);

      // Fetch user balance
      const balanceRes = await api.get('/auth/balance');
      setBalance(balanceRes.data.data.balance || 0);

      // Fetch dues information
      const duesRes = await api.get('/auth/dues');
      const duesData = duesRes.data.data;
      setTotalDues(duesData.totalDues || 0);
      setPendingOrders(duesData.pendingOrders || []);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/auth/payments', {
        amount: parseFloat(newPayment.amount),
        type: 'credit',
        description: newPayment.description || 'Wallet top-up'
      });

      setShowAddPayment(false);
      setNewPayment({ amount: '', description: '' });
      await fetchWalletData();
      alert('Payment added successfully!');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment. Please try again.');
    }
  };

  const handlePayDues = async (orderIds?: string[]) => {
    try {
      const amountToPay = orderIds 
        ? pendingOrders
            .filter(order => orderIds.includes(order._id))
            .reduce((sum, order) => sum + order.totalAmount, 0)
        : totalDues;

      if (balance < amountToPay) {
        alert(`Insufficient balance! You need ₹${(amountToPay - balance).toFixed(2)} more.`);
        return;
      }

      // Create debit transaction for payment
      await api.post('/auth/payments', {
        amount: amountToPay,
        type: 'debit',
        description: orderIds 
          ? `Payment for ${orderIds.length} order(s)`
          : 'Payment for all pending dues'
      });

      // Update order payment status
      if (orderIds) {
        for (const orderId of orderIds) {
          await api.patch(`/orders/${orderId}`, {
            paymentStatus: 'paid',
            paymentMethod: 'balance'
          });
        }
      } else {
        // Pay all pending orders
        for (const order of pendingOrders) {
          await api.patch(`/orders/${order._id}`, {
            paymentStatus: 'paid',
            paymentMethod: 'balance'
          });
        }
      }

      await fetchWalletData();
      alert('Payment successful!');
    } catch (error) {
      console.error('Error paying dues:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} • {user?.studentId}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available Balance</p>
                <p className="text-3xl font-bold mt-2">₹{balance.toFixed(2)}</p>
                <p className="text-green-100 text-sm mt-1">
                  {balance >= totalDues ? 'Sufficient for all dues' : 'Top-up needed'}
                </p>
              </div>
              <DollarSign className="h-12 w-12" />
            </div>
          </div>

          {/* Dues Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Outstanding Dues</p>
                <p className="text-3xl font-bold mt-2">₹{totalDues.toFixed(2)}</p>
                <p className="text-red-100 text-sm mt-1">
                  {pendingOrders.length} pending order(s)
                </p>
              </div>
              <AlertTriangle className="h-12 w-12" />
            </div>
          </div>

          {/* Net Balance Card */}
          <div className={`bg-gradient-to-br ${
            balance - totalDues >= 0 
              ? 'from-blue-500 to-blue-600' 
              : 'from-orange-500 to-orange-600'
          } rounded-2xl p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Net Balance</p>
                <p className="text-3xl font-bold mt-2">
                  ₹{(balance - totalDues).toFixed(2)}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  After paying all dues
                </p>
              </div>
              <CreditCard className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowAddPayment(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Money
          </button>
          
          {totalDues > 0 && (
            <button
              onClick={() => handlePayDues()}
              disabled={balance < totalDues}
              className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                balance >= totalDues
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Pay All Dues (₹{totalDues.toFixed(2)})
            </button>
          )}
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Pending Orders ({pendingOrders.length})
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                These orders are waiting for payment
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingOrders.map((order) => (
                <div key={order._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                          {order.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.foodItemId.name} - ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900">
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePayDues([order._id])}
                      disabled={balance < order.totalAmount}
                      className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        balance >= order.totalAmount
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Pay ₹{order.totalAmount.toFixed(2)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-500" />
              Transaction History
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment._id} className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        payment.type === 'credit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {payment.type === 'credit' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">{payment.description}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-lg font-semibold ${
                        payment.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.type === 'credit' ? '+' : '-'}₹{payment.amount.toFixed(2)}
                      </span>
                      <p className="text-sm text-gray-500">
                        {payment.type === 'credit' ? 'Added' : 'Paid'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500">Your payment history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Money to Wallet</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Monthly allowance"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
