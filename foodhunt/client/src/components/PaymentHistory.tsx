'use client'

import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Payment } from '@/types'

interface PaymentHistoryProps {
  payments: Payment[]
  showUserInfo?: boolean
}

export default function PaymentHistory({ payments, showUserInfo = false }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payment history found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment._id} className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                payment.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {payment.type === 'credit' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {payment.description}
                </p>
                {showUserInfo && payment.user && (
                  <p className="text-xs text-gray-500">
                    {payment.user.name} ({payment.user.rollNumber})
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-lg font-semibold ${
                payment.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {payment.type === 'credit' ? '+' : '-'}₹{payment.amount}
              </span>
              <p className="text-xs text-gray-500">
                {payment.type === 'credit' ? 'Credit' : 'Debit'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
