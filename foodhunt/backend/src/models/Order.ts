import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  items: [{
    foodItemId: {
      type: String,
      required: true,
      ref: 'FoodItem'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate'
  },
  scheduledTime: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['balance', 'cash', 'card'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
