import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    message: 'FoodHunt API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Food items mock data with stock management
const mockFoodItems = [
  {
    _id: '1',
    name: 'Masala Dosa',
    description: 'Crispy South Indian crepe served with coconut chutney and sambar',
    price: 45,
    category: 'breakfast',
    isAvailable: true,
    preparationTime: 15,
    stock: 25,
    maxDailyStock: 50,
    nutritionalInfo: { calories: 320, protein: 8, carbs: 45, fat: 12 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Dal Rice Combo',
    description: 'Yellow lentil curry with steamed basmati rice and pickle',
    price: 55,
    category: 'lunch',
    isAvailable: true,
    preparationTime: 12,
    stock: 18,
    maxDailyStock: 30,
    nutritionalInfo: { calories: 420, protein: 18, carbs: 75, fat: 8 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    name: 'Samosa',
    description: 'Crispy triangular pastry filled with spiced potatoes',
    price: 15,
    category: 'snacks',
    isAvailable: true,
    preparationTime: 5,
    stock: 42,
    maxDailyStock: 100,
    nutritionalInfo: { calories: 150, protein: 3, carbs: 18, fat: 8 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '4',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea',
    price: 10,
    category: 'beverages',
    isAvailable: true,
    preparationTime: 3,
    stock: 35,
    maxDailyStock: 80,
    nutritionalInfo: { calories: 50, protein: 2, carbs: 8, fat: 2 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '5',
    name: 'Veg Biryani',
    description: 'Aromatic basmati rice with mixed vegetables and spices',
    price: 75,
    category: 'lunch',
    isAvailable: true,
    preparationTime: 20,
    stock: 12,
    maxDailyStock: 25,
    nutritionalInfo: { calories: 380, protein: 12, carbs: 65, fat: 10 },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Reservations/Orders data
const mockReservations = [
  {
    _id: 'res001',
    userId: '1',
    foodItemId: '2',
    quantity: 1,
    totalAmount: 55,
    status: 'pending', // pending, ready, completed, cancelled
    reservationDate: new Date().toISOString(),
    preferredPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
    actualPickupTime: null,
    paymentStatus: 'pending', // pending, paid, overdue
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'res002',
    userId: '4',
    foodItemId: '1',
    quantity: 2,
    totalAmount: 90,
    status: 'ready',
    reservationDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    preferredPickupTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
    actualPickupTime: null,
    paymentStatus: 'pending',
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
    notes: 'Extra spicy',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock users (updated for reservation system)
const mockUsers = [
  {
    _id: '1',
    studentId: 'STU001',
    name: 'Demo Student',
    email: 'student@demo.com',
    role: 'student',
    department: 'Computer Science',
    year: 2,
    totalDues: 155, // Total amount owed
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    studentId: 'ADM001',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin',
    department: 'Administration',
    totalDues: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    studentId: 'STF001',
    name: 'Canteen Staff',
    email: 'staff@demo.com',
    role: 'staff',
    department: 'Food Services',
    totalDues: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '4',
    studentId: 'STU002',
    name: 'Jane Smith',
    email: 'jane@demo.com',
    role: 'student',
    department: 'Electronics Engineering',
    year: 3,
    totalDues: 90,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Food routes
app.get('/api/food', (req, res) => {
  const { category } = req.query;
  let items = mockFoodItems;
  
  if (category) {
    items = items.filter(item => item.category === category);
  }
  
  res.json(items);
});

app.get('/api/food/:id', (req, res) => {
  const item = mockFoodItems.find(item => item._id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Food item not found' });
  }
  res.json(item);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Simple mock token validation - extract user ID from token
  const userId = token.replace('mock-jwt-token-', '');
  const user = mockUsers.find(u => u._id === userId);
  
  if (!user) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  req.user = user;
  next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email);
  if (!user || password !== 'password123') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Mock JWT token
  const token = 'mock-jwt-token-' + user._id;
  
  res.json({
    message: 'Login successful',
    token,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { studentId, name, email, password, department, year } = req.body;
  
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const newUser = {
    _id: String(mockUsers.length + 1),
    studentId,
    name,
    email,
    role: 'student',
    department,
    year,
    balance: 0,
    isActive: true
  };
  
  mockUsers.push(newUser);

  const token = 'mock-jwt-token-' + newUser._id;
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: newUser
  });
});

// Protected routes
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile retrieved successfully',
    user: req.user
  });
});

app.get('/api/users', authenticateToken, (req, res) => {
  // Only admin can view all users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  res.json({
    message: 'Users retrieved successfully',
    users: mockUsers
  });
});

app.patch('/api/auth/balance', authenticateToken, (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  
  // Find user and update dues (changed from balance)
  const userIndex = mockUsers.findIndex(u => u._id === req.user._id);
  if (userIndex !== -1) {
    mockUsers[userIndex].totalDues += amount;
    mockUsers[userIndex].updatedAt = new Date().toISOString();
    
    res.json({
      message: 'Dues updated successfully',
      user: mockUsers[userIndex]
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// === MENU MANAGEMENT ENDPOINTS (ADMIN) ===

// Add new food item (Admin only)
app.post('/api/admin/menu', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, description, price, category, stock, maxDailyStock, preparationTime, nutritionalInfo } = req.body;
  
  const newItem = {
    _id: String(mockFoodItems.length + 1),
    name,
    description,
    price: Number(price),
    category,
    isAvailable: true,
    preparationTime: Number(preparationTime),
    stock: Number(stock),
    maxDailyStock: Number(maxDailyStock),
    nutritionalInfo: nutritionalInfo || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockFoodItems.push(newItem);
  
  res.status(201).json({
    message: 'Food item added successfully',
    item: newItem
  });
});

// Update food item stock (Admin only)
app.patch('/api/admin/menu/:id/stock', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { stock, maxDailyStock } = req.body;
  const itemIndex = mockFoodItems.findIndex(item => item._id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Food item not found' });
  }

  if (stock !== undefined) mockFoodItems[itemIndex].stock = Number(stock);
  if (maxDailyStock !== undefined) mockFoodItems[itemIndex].maxDailyStock = Number(maxDailyStock);
  mockFoodItems[itemIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Stock updated successfully',
    item: mockFoodItems[itemIndex]
  });
});

// Update food item availability (Admin only)
app.patch('/api/admin/menu/:id/availability', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { isAvailable } = req.body;
  const itemIndex = mockFoodItems.findIndex(item => item._id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Food item not found' });
  }

  mockFoodItems[itemIndex].isAvailable = Boolean(isAvailable);
  mockFoodItems[itemIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Availability updated successfully',
    item: mockFoodItems[itemIndex]
  });
});

// === RESERVATION ENDPOINTS ===

// Create reservation (Students/Staff)
app.post('/api/reservations', authenticateToken, (req, res) => {
  const { foodItemId, quantity, preferredPickupTime, notes } = req.body;
  
  const foodItem = mockFoodItems.find(item => item._id === foodItemId);
  if (!foodItem) {
    return res.status(404).json({ message: 'Food item not found' });
  }

  if (!foodItem.isAvailable) {
    return res.status(400).json({ message: 'Food item is not available' });
  }

  if (foodItem.stock < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  // Update stock
  const itemIndex = mockFoodItems.findIndex(item => item._id === foodItemId);
  mockFoodItems[itemIndex].stock -= quantity;

  const newReservation = {
    _id: 'res' + String(mockReservations.length + 1).padStart(3, '0'),
    userId: req.user._id,
    foodItemId,
    quantity: Number(quantity),
    totalAmount: foodItem.price * quantity,
    status: 'pending',
    reservationDate: new Date().toISOString(),
    preferredPickupTime: preferredPickupTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    actualPickupTime: null,
    paymentStatus: 'pending',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockReservations.push(newReservation);

  // Update user dues
  const userIndex = mockUsers.findIndex(u => u._id === req.user._id);
  if (userIndex !== -1) {
    mockUsers[userIndex].totalDues += newReservation.totalAmount;
  }

  res.status(201).json({
    message: 'Reservation created successfully',
    reservation: newReservation
  });
});

// Get user's reservations
app.get('/api/reservations/my', authenticateToken, (req, res) => {
  const userReservations = mockReservations
    .filter(res => res.userId === req.user._id)
    .map(reservation => {
      const foodItem = mockFoodItems.find(item => item._id === reservation.foodItemId);
      return {
        ...reservation,
        foodItem: foodItem ? {
          name: foodItem.name,
          description: foodItem.description,
          price: foodItem.price,
          category: foodItem.category
        } : null
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    message: 'Reservations retrieved successfully',
    reservations: userReservations
  });
});

// Get all reservations (Admin only)
app.get('/api/admin/reservations', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { status } = req.query;
  let reservations = mockReservations;

  if (status) {
    reservations = reservations.filter(res => res.status === status);
  }

  const reservationsWithDetails = reservations.map(reservation => {
    const user = mockUsers.find(u => u._id === reservation.userId);
    const foodItem = mockFoodItems.find(item => item._id === reservation.foodItemId);
    
    return {
      ...reservation,
      user: user ? {
        name: user.name,
        studentId: user.studentId,
        department: user.department
      } : null,
      foodItem: foodItem ? {
        name: foodItem.name,
        description: foodItem.description,
        price: foodItem.price,
        category: foodItem.category
      } : null
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    message: 'All reservations retrieved successfully',
    reservations: reservationsWithDetails
  });
});

// Update reservation status (Admin only)
app.patch('/api/admin/reservations/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { status } = req.body;
  const reservationIndex = mockReservations.findIndex(res => res._id === req.params.id);
  
  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  mockReservations[reservationIndex].status = status;
  
  if (status === 'completed') {
    mockReservations[reservationIndex].actualPickupTime = new Date().toISOString();
  }
  
  mockReservations[reservationIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Reservation status updated successfully',
    reservation: mockReservations[reservationIndex]
  });
});

// Get user dues summary
app.get('/api/dues/summary', authenticateToken, (req, res) => {
  const userReservations = mockReservations.filter(res => res.userId === req.user._id);
  const pendingPayments = userReservations.filter(res => res.paymentStatus === 'pending');
  const overduePayments = pendingPayments.filter(res => new Date(res.dueDate) < new Date());
  
  res.json({
    totalDues: req.user.totalDues,
    pendingPayments: pendingPayments.length,
    overduePayments: overduePayments.length,
    nextDueDate: pendingPayments.length > 0 ? 
      pendingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0].dueDate : 
      null
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 API health check: http://localhost:${PORT}/api/health`);
});
