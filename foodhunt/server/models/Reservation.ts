import mongoose, { Schema, Document } from 'mongoose';

interface IReservationDocument extends Document {
  userId: string;
  items: {
    stockId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reservationDate: Date;
  timeSlot: string;
}

const ReservationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  reservationDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IReservationDocument>('Reservation', ReservationSchema);
