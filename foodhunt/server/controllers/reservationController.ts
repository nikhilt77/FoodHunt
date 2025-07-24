import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import Stock from '../models/Stock';
import User from '../models/User';
import Payment from '../models/Payment';

interface AuthRequest extends Request {
  user?: any;
}

export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { foodItems, reservationDate, timeSlot } = req.body;
    const userId = req.user._id;

    let totalAmount = 0;
    const reservationItems = [];

    // Validate items and calculate total
    for (const item of foodItems) {
      const stock = await Stock.findById(item.foodItem);
      if (!stock) {
        return res.status(404).json({ 
          success: false, 
          message: `Stock item not found: ${item.foodItem}` 
        });
      }

      if (stock.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${stock.itemName}. Available: ${stock.quantity}` 
        });
      }

      const itemTotal = stock.price * item.quantity;
      totalAmount += itemTotal;

      reservationItems.push({
        stockId: item.foodItem,
        quantity: item.quantity,
        price: stock.price
      });
    }

    const reservation = new Reservation({
      userId,
      items: reservationItems,
      totalAmount,
      reservationDate: new Date(reservationDate),
      timeSlot,
      status: 'pending'
    });

    await reservation.save();

    // Update stock quantities
    for (const item of foodItems) {
      await Stock.findByIdAndUpdate(
        item.foodItem,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Add to user dues
    await User.findByIdAndUpdate(userId, { $inc: { dues: totalAmount } });

    await reservation.populate('items.stockId userId');
    res.status(201).json({ 
      success: true, 
      message: 'Reservation created successfully', 
      data: reservation 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating reservation', 
      error: error 
    });
  }
};

export const getUserReservations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const reservations = await Reservation.find({ userId })
      .populate('items.stockId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reservations', 
      error: error 
    });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId', 'name email rollNumber')
      .populate('items.stockId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reservations', 
      error: error 
    });
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.stockId userId');

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reservation not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Reservation status updated successfully', 
      data: reservation 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating reservation status', 
      error: error 
    });
  }
};
