import { Request, Response } from 'express';
import Stock from '../models/Stock';

interface AuthRequest extends Request {
  user?: any;
}

export const createStock = async (req: AuthRequest, res: Response) => {
  try {
    const { itemName, price, quantity, category, description } = req.body;

    const stock = new Stock({
      itemName,
      price,
      quantity,
      category,
      description,
      isAvailable: quantity > 0
    });

    await stock.save();
    res.status(201).json({ 
      success: true, 
      message: 'Stock item created successfully', 
      data: stock 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating stock item', 
      error: error 
    });
  }
};

export const getAllStock = async (req: Request, res: Response) => {
  try {
    const stock = await Stock.find().sort({ createdAt: -1 });
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stock items', 
      error: error 
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const stock = await Stock.findByIdAndUpdate(
      id,
      { ...updateData, isAvailable: updateData.quantity > 0 },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Stock updated successfully', 
      data: stock 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating stock item', 
      error: error 
    });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findByIdAndDelete(id);
    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Stock item deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting stock item', 
      error: error 
    });
  }
};
