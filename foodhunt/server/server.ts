import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canteen_management')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  rollNumber: { type: String },
  dues: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Stock Schema
const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  available: { type: Boolean, default: true }
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItems: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  reservationDate: { type: String, required: true },
  timeSlot: { type: String, required: true }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String, required: true }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

// Auth middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ name, email, password, role, rollNumber });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          dues: user.dues
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          dues: user.dues
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Food Items Routes
app.get('/api/food-items', authenticate, async (req, res) => {
  try {
    const items = await Stock.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/food-items', authenticate, async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;
    const item = new Stock({ name, price, stock, category, description });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Reservations Routes
app.get('/api/reservations', authenticate, async (req: any, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id }).populate('foodItems.foodItem');
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/reservations', authenticate, async (req: any, res) => {
  try {
    const { foodItems, reservationDate, timeSlot } = req.body;
    
    let totalAmount = 0;
    for (const item of foodItems) {
      const foodItem = await Stock.findById(item.foodItem);
      if (foodItem) {
        totalAmount += foodItem.price * item.quantity;
      }
    }

    const reservation = new Reservation({
      userId: req.user._id,
      foodItems,
      totalAmount,
      reservationDate,
      timeSlot
    });

    await reservation.save();
    
    // Add to user dues
    await User.findByIdAndUpdate(req.user._id, { $inc: { dues: totalAmount } });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Payments Routes
app.get('/api/payments', authenticate, async (req: any, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/payments', authenticate, async (req: any, res) => {
  try {
    const { amount, type, description } = req.body;
    
    const payment = new Payment({
      userId: req.user._id,
      amount,
      type,
      description
    });

    await payment.save();

    // Update user dues
    if (type === 'credit') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { dues: -amount } });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Users route (admin only)
app.get('/api/users', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lowStockItems = await Stock.countDocuments({ stock: { $lte: 5 } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalReservations,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockItems,
        pendingDues: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
