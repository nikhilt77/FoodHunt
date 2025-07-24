export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  rollNumber?: string;
  dues: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStock {
  _id?: string;
  itemName: string;
  quantity: number;
  price: number;
  category: string;
  isAvailable: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReservation {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPayment {
  _id?: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reservationId?: string;
  transactionId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
