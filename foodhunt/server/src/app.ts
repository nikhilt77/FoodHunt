import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import stockRoutes from './routes/stockRoutes';
import reservationRoutes from './routes/reservationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { authenticate } from './middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/food-items', authenticate, stockRoutes);
app.use('/api/reservations', authenticate, reservationRoutes);
app.use('/api/payments', authenticate, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
