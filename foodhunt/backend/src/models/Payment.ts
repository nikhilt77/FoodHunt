import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types';

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  orderId: {
    type: String,
    ref: 'Order'
  },
  transactionId: {
    type: String,
    default: () => `TXN${Date.now()}`,
    unique: true
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
