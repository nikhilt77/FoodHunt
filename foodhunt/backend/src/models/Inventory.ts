import mongoose, { Schema } from 'mongoose';
import { IInventory } from '../types';

const inventorySchema = new Schema<IInventory>({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['ingredients', 'packaging', 'equipment'],
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
