import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem';
import { validationResult, body } from 'express-validator';
import { migrateFoodItems } from '../utils/migration';

interface AuthRequest extends Request {
  user?: any;
}

export const foodValidation = {
  create: [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages']).withMessage('Invalid category'),
    body('preparationTime').isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute')
  ]
};

export const getAllFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, available } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    
    const foodItems = await FoodItem.find(filter).sort({ createdAt: -1 });
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getFoodItemById = async (req: Request, res: Response) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = new FoodItem(req.body);
    await foodItem.save();
    res.status(201).json({ message: 'Food item created successfully', foodItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    // Get the current item first to check if it exists
    const currentItem = await FoodItem.findById(req.params.id);
    
    if (!currentItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Prepare update data with explicit field handling
    const updateData = { ...req.body };
    
    // If stock or maxDailyStock are being updated, ensure they're properly set
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
    }
    if (updateData.maxDailyStock !== undefined) {
      updateData.maxDailyStock = Number(updateData.maxDailyStock);
    }

    console.log('Updating food item:', req.params.id, 'with data:', updateData);

    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, upsert: false }
    );
    
    console.log('Updated food item result:', {
      name: foodItem?.name,
      stock: foodItem?.stock,
      maxDailyStock: foodItem?.maxDailyStock
    });
    
    res.json({ message: 'Food item updated successfully', foodItem });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Migration endpoint to fix existing items without stock fields
export const migrateFoodItemsEndpoint = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔄 Migration endpoint called');
    const success = await migrateFoodItems();
    
    if (success) {
      res.status(200).json({ message: 'Migration completed successfully' });
    } else {
      res.status(500).json({ message: 'Migration failed' });
    }
  } catch (error) {
    console.error('Migration endpoint error:', error);
    res.status(500).json({ message: 'Migration failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
