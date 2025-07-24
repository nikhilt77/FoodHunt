# College Canteen Management System

A full-stack web application for managing college canteen operations, including user registration, food ordering, reservation management, stock tracking, and payment processing.

## Features

### For Students:
- User registration and authentication
- Browse available food items
- Make food reservations for specific time slots
- Track personal dues and payment history
- View reservation history and status

### For Administrators:
- Manage food inventory and stock levels
- Track all student reservations
- Monitor payment transactions
- View analytics and dashboard statistics
- Manage user accounts and dues

## Tech Stack

### Frontend:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend:
- **Express.js** - Node.js web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   └── types/         # TypeScript definitions
│   ├── package.json
│   └── ...
├── server/                # Express.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FoodHunt/foodhunt
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env file with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Environment Variables**
   
   Backend (.env):
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/canteen_management
   JWT_SECRET=your_jwt_secret_key
   ```
   
   Frontend (.env.local):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Stock Management
- `GET /api/stock` - Get all food items
- `POST /api/stock` - Create new food item (Admin only)
- `PUT /api/stock/:id` - Update food item (Admin only)
- `DELETE /api/stock/:id` - Delete food item (Admin only)

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations/all` - Get all reservations (Admin only)
- `PUT /api/reservations/:id/status` - Update reservation status (Admin only)

### Payments
- `GET /api/payments` - Get user payments
- `POST /api/payments` - Record new payment
- `GET /api/payments/all` - Get all payments (Admin only)

## Database Models

### User
- name, email, password
- role (student/admin)
- rollNumber (for students)
- dues (outstanding amount)

### Stock
- itemName, price, quantity
- category, description
- isAvailable

### Reservation
- userId, items, totalAmount
- status, reservationDate, timeSlot

### Payment
- userId, amount, type (credit/debit)
- description, transactionId

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
