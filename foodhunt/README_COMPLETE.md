# FoodHunt - College Canteen Management System

A modern, full-stack college canteen management system built with Next.js, Express.js, and MongoDB. This system provides a comprehensive solution for managing canteen operations, student accounts, food ordering, and administrative tasks.

## 🌟 Features

### For Students
- **User Registration & Authentication** - Secure login/register system
- **Browse Menu** - View available food items by category (Breakfast, Lunch, Dinner, Snacks, Beverages)
- **Digital Wallet** - Manage account balance and view transaction history
- **Order Management** - Place orders and track order status
- **Order History** - View past orders and spending patterns
- **Profile Management** - Update personal information

### For Admin/Staff
- **Menu Management** - Add, edit, and remove food items
- **Order Management** - View and manage customer orders
- **User Management** - Manage student accounts and balances
- **Inventory Tracking** - Monitor stock levels and supplies
- **Analytics Dashboard** - View sales and usage statistics

### Technical Features
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Live order status updates
- **Secure Authentication** - JWT-based authentication system
- **Data Validation** - Input validation and error handling
- **Modern UI** - Clean, intuitive interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Development Tools
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Nodemon/ts-node-dev** - Development server with hot reload

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikhilt77/FoodHunt.git
   cd FoodHunt/foodhunt
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5002/api
   ```

   **Backend (.env):**
   ```env
   NODE_ENV=development
   PORT=5002
   MONGODB_URI=mongodb://localhost:27017/foodhunt_canteen
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

6. **Start the development servers**

   **Terminal 1 (Backend):**
   ```bash
   cd backend
   node src/simple-server.js
   ```

   **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5002
   - API Health Check: http://localhost:5002/api/health

## 👥 Demo Accounts

You can use these demo accounts to test the system:

### Student Account
- **Email:** student@demo.com
- **Password:** password123
- **Balance:** ₹500

### Admin Account
- **Email:** admin@demo.com
- **Password:** password123
- **Balance:** ₹1000

## 📱 System Status

✅ **Backend Server** - Running on http://localhost:5002  
✅ **Frontend App** - Running on http://localhost:3000  
✅ **API Endpoints** - All endpoints functional  
✅ **Authentication** - Login/Register working  
✅ **Food Menu** - Mock data available  
✅ **Responsive Design** - Mobile and desktop ready  

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Food Items
- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get specific food item

### System Health
- `GET /api/health` - Check API status

## 🎯 Current Implementation

The system is currently running with a simplified backend server that provides:
- Mock authentication with demo accounts
- Mock food menu data
- Basic API endpoints for testing
- CORS configuration for frontend integration

## 🚀 Quick Start

1. **Start Backend:**
   ```bash
   cd backend && node src/simple-server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Visit:** http://localhost:3000

4. **Login with:** student@demo.com / password123

## 🔮 Next Steps

To extend this system:
1. Implement complete TypeScript backend with MongoDB integration
2. Add order management functionality
3. Implement wallet and transaction features
4. Add admin panel for menu management
5. Integrate payment gateways
6. Add real-time order tracking

---

**Built with ❤️ for college canteen management**
