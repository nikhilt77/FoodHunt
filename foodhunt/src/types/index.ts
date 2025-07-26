export interface User {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  department?: string;
  year?: number;
  totalDues: number;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  foodItemId: string;
  quantity: number;
  price: number;
  foodItem?: FoodItem;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'immediate' | 'scheduled';
  scheduledTime?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'balance' | 'cash' | 'card';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reservationId?: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  studentId: string;
  name: string;
  email: string;
  password: string;
  department?: string;
  year?: number;
}
