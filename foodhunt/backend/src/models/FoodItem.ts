import mongoose, { Schema } from 'mongoose';
import { IFoodItem } from '../types';

const foodItemSchema = new Schema<IFoodItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxDailyStock: {
    type: Number,
    required: true,
    default: 50,
    min: 1
  },
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 }
  }
}, {
  timestamps: true
});

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
