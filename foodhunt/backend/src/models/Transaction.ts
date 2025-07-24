import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../types';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
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
  balanceBefore: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
