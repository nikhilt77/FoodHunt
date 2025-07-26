export interface IUser {
    _id?: string;
    studentId: string;
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin' | 'staff';
    department?: string;
    year?: number;
    balance: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IFoodItem {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
    image?: string;
    isAvailable: boolean;
    preparationTime: number;
    stock: number;
    maxDailyStock: number;
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IOrder {
    _id?: string;
    userId: string;
    items: Array<{
        foodItemId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    orderType: 'immediate' | 'scheduled';
    scheduledTime?: Date;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: 'balance' | 'cash' | 'card';
    notes?: string;
    preparationStartedAt?: Date;
    estimatedReadyTime?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ITransaction {
    _id?: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    orderId?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt?: Date;
}
export interface IPayment {
    _id?: string;
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    orderId?: string;
    transactionId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IInventory {
    _id?: string;
    itemName: string;
    category: 'ingredients' | 'packaging' | 'equipment';
    currentStock: number;
    minStockLevel: number;
    unit: string;
    costPerUnit: number;
    supplier?: string;
    lastRestocked?: Date;
    expiryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=index.d.ts.map