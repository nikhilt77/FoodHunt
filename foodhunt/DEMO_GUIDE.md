# FoodHunt Demo Credentials & Features

## Available Demo Accounts

### Student Account
- **Email:** student@demo.com
- **Password:** password123
- **Features:** Reserve food, view orders, track dues
- **Current Dues:** ₹155

### Staff Account
- **Email:** staff@demo.com
- **Password:** password123
- **Features:** Same as student + help with orders
- **Current Dues:** ₹45

### Admin Account
- **Email:** admin@demo.com
- **Password:** password123
- **Features:** Full system access + menu/stock management + view all reservations
- **Current Dues:** ₹0

## How to Test

1. **Visit the login page:** http://localhost:3000/auth/login
2. **Auto-fill credentials:** Click on any demo account in the blue box to auto-fill
3. **Login:** Click "Sign in" button
4. **Explore dashboard:** You'll see role-specific welcome messages and features

## New Features Implemented

### For Students/Staff (Users):
- ✅ **Dynamic Menu Viewing** - Real-time stock updates
- ✅ **Food Reservation System** - Reserve food instead of buying
- ✅ **Dues Tracking** - View total dues and payment deadlines
- ✅ **Order History** - View all reservations and their status
- ✅ **Payment Reminders** - 10-day due date system with alerts
- ✅ **Stock-based Availability** - Can only reserve if stock available

### For Admin (Chef/Canteen Owner):
- ✅ **Menu Management** - Add new food items with stock limits
- ✅ **Stock Management** - Update stock quantities in real-time
- ✅ **Availability Control** - Enable/disable food items
- ✅ **Reservation Monitoring** - View all student reservations
- ✅ **Order Status Management** - Mark orders as ready/completed
- ✅ **User Information** - See who reserved what food

## Key Features Explained

### Dynamic Menu System
- **Real-time stock updates** when reservations are made
- **Category filtering** (breakfast, lunch, dinner, snacks, beverages)
- **Visual stock indicators** (red/yellow/green based on remaining stock)
- **Auto-disable** when out of stock

### Reservation Flow
1. **Student selects food** and quantity from available menu
2. **Stock automatically reduces** when reservation is made
3. **Payment due date set** to 10 days from reservation
4. **Admin can track** all reservations and mark as ready/completed

### Dues Management
- **No wallet system** - everything is on credit
- **10-day payment terms** for all reservations
- **Due alerts** shown prominently to users
- **Overdue tracking** for admin monitoring

## Navigation Guide

### As Student/Staff:
- **Dashboard** → Click "Order Food" → Opens menu with reservation system
- **Dashboard** → Click "Order History" → Shows your reservations
- **Menu Page** → Reserve food, view your orders, track dues

### As Admin:
- **Dashboard** → Click "Admin Panel" → Opens admin interface
- **Admin Panel** → "Menu Management" tab → Add items, update stock
- **Admin Panel** → "Reservations" tab → View all orders, update status

## Testing Scenarios

1. **Login as student** → Reserve food → See stock decrease
2. **Login as admin** → View reservation → Mark as ready/completed
3. **Check dues alerts** → Students see payment reminders
4. **Test stock management** → Admin updates stock, users see changes
5. **Category filtering** → Filter menu by breakfast, lunch, etc.

## Technical Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Real-time UI updates
- **Backend:** Express.js with reservation/stock management
- **Data:** Mock data with stock tracking and dues system
- **Authentication:** JWT-like token system with role-based access

## Current Status
✅ **Complete reservation-based food system**
✅ **Real-time stock management** 
✅ **Admin menu and reservation management**
✅ **Dues tracking with payment reminders**
✅ **Dynamic UI updates based on stock/reservations**

**Both servers running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5002
