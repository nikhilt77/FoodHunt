# FoodHunt Dues Handling System

## Overview
The FoodHunt application now includes a comprehensive dues and payment management system that allows students to manage their payments and administrators to track outstanding balances.

## Key Features

### 1. Student Wallet System
- **Balance Management**: Students can add money to their wallet and track their balance
- **Payment History**: Complete transaction history with credit/debit records
- **Dues Tracking**: Real-time tracking of outstanding orders and payment obligations
- **Instant Payments**: Pay individual orders or all dues at once

### 2. Payment Processing
- **Credit Transactions**: Adding money to wallet (top-ups, allowances)
- **Debit Transactions**: Paying for orders or settling dues
- **Balance Validation**: Prevents overdrafts by checking sufficient balance
- **Transaction Records**: All payments are logged with detailed descriptions

### 3. Order Integration
- **Automatic Dues Creation**: When students place orders, dues are automatically created
- **Payment Status Tracking**: Orders track whether they're paid, pending, or overdue
- **Flexible Payment Options**: Pay with balance, cash, or card
- **Order Status Updates**: Payment status automatically updates order records

## API Endpoints

### Authentication Required Endpoints
All payment endpoints require valid JWT authentication.

#### Payment Management
- `POST /api/auth/payments` - Create a new payment (credit/debit)
- `GET /api/auth/payments` - Get user's payment history
- `GET /api/auth/balance` - Get current user balance
- `GET /api/auth/dues` - Get user's outstanding dues and pending orders

#### Order Management
- `PATCH /api/orders/:orderId` - Update order payment status
- `GET /api/orders/my-orders` - Get user's orders with payment status

#### Admin Only
- `GET /api/auth/payments/all` - Get all payments (admin only)
- `POST /api/admin/students/:studentId/mark-paid` - Mark specific orders as paid
- `POST /api/admin/students/:studentId/mark-all-paid` - Mark all student dues as paid

## Database Schema

### Payment Model
```typescript
interface IPayment {
  _id?: string;
  userId: string;           // Reference to User
  amount: number;           // Payment amount
  type: 'credit' | 'debit'; // Transaction type
  description: string;      // Payment description
  orderId?: string;         // Optional order reference
  transactionId: string;    // Unique transaction ID
  createdAt?: Date;
  updatedAt?: Date;
}
```

### User Model (Updated)
```typescript
interface IUser {
  // ... existing fields
  balance: number;          // Current wallet balance
  // ... other fields
}
```

### Order Model (Updated)
```typescript
interface IOrder {
  // ... existing fields
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'balance' | 'cash' | 'card';
  // ... other fields
}
```

## Frontend Components

### Wallet Page (`/wallet`)
- **Balance Overview**: Shows available balance, outstanding dues, and net balance
- **Payment Actions**: Add money to wallet, pay individual orders, pay all dues
- **Transaction History**: Complete list of all credits and debits
- **Pending Orders**: List of unpaid orders with individual pay buttons

### Dashboard Integration
- **Dues Display**: Shows outstanding dues in header
- **Quick Access**: Direct link to wallet page from dashboard
- **Balance Indicator**: Visual indication of payment status

### Admin Interface
- **Student Dues Management**: View and manage all student dues
- **Payment Tracking**: Monitor payment patterns and outstanding amounts
- **Bulk Operations**: Mark multiple orders as paid simultaneously

## Payment Flow

### Student Places Order
1. Student selects items and places order
2. Order is created with `paymentStatus: 'pending'`
3. Order amount is added to student's dues
4. Student receives notification of new due

### Student Makes Payment
1. Student accesses wallet page
2. Adds money to wallet if needed (credit transaction)
3. Pays for specific orders or all dues (debit transaction)
4. Order status updates to `paymentStatus: 'paid'`
5. Student's balance is reduced by payment amount

### Admin Management
1. Admin views student dues in admin panel
2. Can mark orders as paid manually (cash payments)
3. Can view detailed payment history for any student
4. Can generate payment reports and analytics

## Security Features

- **Authentication Required**: All payment operations require valid JWT tokens
- **Balance Validation**: Prevents payments exceeding available balance
- **Transaction Logging**: All payment activities are permanently logged
- **Admin Authorization**: Sensitive operations restricted to admin users
- **Unique Transaction IDs**: Each payment has a unique identifier

## Error Handling

- **Insufficient Balance**: Clear error messages when balance is too low
- **Invalid Amounts**: Validation for positive payment amounts
- **Authentication Errors**: Proper handling of expired or invalid tokens
- **Network Errors**: Graceful handling of connection issues

## Mobile Responsiveness

The wallet interface is fully responsive and optimized for mobile devices:
- Touch-friendly buttons for payment actions
- Clear visual hierarchy for balance information
- Easy navigation between payment history and pending orders
- Optimized forms for mobile input

## Future Enhancements

1. **Payment Gateway Integration**: Support for online payments (UPI, cards)
2. **Automated Reminders**: Email/SMS notifications for overdue payments
3. **Payment Plans**: Installment options for large orders
4. **Loyalty Points**: Reward system for frequent customers
5. **Financial Reports**: Detailed spending analytics for students
6. **Parent Portal**: Allow parents to monitor and add funds to student accounts

## Usage Instructions

### For Students:
1. Login to your account
2. Click "Wallet" from the dashboard menu
3. View your current balance and any outstanding dues
4. Add money using the "Add Money" button
5. Pay individual orders or all dues using the payment buttons
6. Review your transaction history anytime

### For Administrators:
1. Access the admin panel
2. Navigate to the "Student Dues" tab
3. View all students with outstanding balances
4. Use "Mark All Paid" for cash payments
5. View detailed payment history for any student
6. Generate reports for financial tracking

This comprehensive dues handling system ensures smooth financial operations while providing transparency and convenience for all users.
