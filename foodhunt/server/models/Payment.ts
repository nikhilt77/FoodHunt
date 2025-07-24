import mongoose, { Schema, Document } from 'mongoose';

interface IPaymentDocument extends Document {
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reservationId?: string;
  transactionId: string;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  type: { 
    type: String, 
    enum: ['credit', 'debit'], 
    required: true 
  },
  description: { type: String, required: true },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  transactionId: { type: String, default: () => `TXN${Date.now()}` }
}, {
  timestamps: true
});

export default mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
