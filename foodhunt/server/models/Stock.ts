import mongoose, { Schema, Document } from 'mongoose';

interface IStockDocument extends Document {
  itemName: string;
  quantity: number;
  price: number;
  category: string;
  isAvailable: boolean;
  description?: string;
}

const StockSchema: Schema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IStockDocument>('Stock', StockSchema);
