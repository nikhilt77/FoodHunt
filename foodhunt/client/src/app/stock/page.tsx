'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { Plus, Package, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { User, FoodItem } from '@/types'

export default function StockPage() {
  const [user, setUser] = useState<User | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    available: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    const userObj = JSON.parse(userData)
    if (userObj.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    setUser(userObj)
    fetchFoodItems()
  }, [router])

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFoodItems(data.data)
      }
    } catch (error) {
      console.error('Error fetching food items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingItem 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food-items/${editingItem._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food-items`
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowAddItem(false)
        setEditingItem(null)
        setFormData({
          name: '',
          price: '',
          category: '',
          stock: '',
          description: '',
          available: true
        })
        fetchFoodItems()
        alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!')
      } else {
        alert(data.message || 'Failed to save item')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      stock: item.stock.toString(),
      description: item.description || '',
      available: item.available
    })
    setShowAddItem(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/food-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        fetchFoodItems()
        alert('Item deleted successfully!')
      } else {
        alert(data.message || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  const lowStockItems = foodItems.filter(item => item.stock <= 5)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600 mt-1">Manage your food inventory</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({
                name: '',
                price: '',
                category: '',
                stock: '',
                description: '',
                available: true
              })
              setShowAddItem(true)
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {lowStockItems.length} item(s) have low stock (≤5 units)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <div key={item._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-primary-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Price:</span>
                    <span className="text-sm font-medium">₹{item.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <span className={`text-sm font-medium ${item.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.stock} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mt-3">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select category</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                      Available for ordering
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddItem(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
