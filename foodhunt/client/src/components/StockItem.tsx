'use client'

import { Package, AlertTriangle } from 'lucide-react'
import { FoodItem } from '@/types'

interface StockItemProps {
  item: FoodItem
  onEdit?: (item: FoodItem) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export default function StockItem({ 
  item, 
  onEdit, 
  onDelete, 
  showActions = false 
}: StockItemProps) {
  const isLowStock = item.stock <= 5

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${isLowStock ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-primary-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
        </div>
        
        {isLowStock && (
          <AlertTriangle className="h-6 w-6 text-red-500" />
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Price:</span>
          <span className="text-sm font-medium">₹{item.price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Stock:</span>
          <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
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
        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
      )}

      {showActions && (
        <div className="flex space-x-2 pt-3 border-t">
          <button
            onClick={() => onEdit && onEdit(item)}
            className="flex-1 text-xs bg-primary-500 text-white px-3 py-2 rounded hover:bg-primary-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(item._id)}
            className="flex-1 text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
