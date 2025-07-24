"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateFoodItemsEndpoint = exports.deleteFoodItem = exports.updateFoodItem = exports.createFoodItem = exports.getFoodItemById = exports.getAllFoodItems = exports.foodValidation = void 0;
const FoodItem_1 = require("../models/FoodItem");
const express_validator_1 = require("express-validator");
const migration_1 = require("../utils/migration");
exports.foodValidation = {
    create: [
        (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        (0, express_validator_1.body)('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
        (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        (0, express_validator_1.body)('category').isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages']).withMessage('Invalid category'),
        (0, express_validator_1.body)('preparationTime').isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute')
    ]
};
const getAllFoodItems = async (req, res) => {
    try {
        const { category, available } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (available !== undefined)
            filter.isAvailable = available === 'true';
        const foodItems = await FoodItem_1.FoodItem.find(filter).sort({ createdAt: -1 });
        res.json(foodItems);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllFoodItems = getAllFoodItems;
const getFoodItemById = async (req, res) => {
    try {
        const foodItem = await FoodItem_1.FoodItem.findById(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json(foodItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getFoodItemById = getFoodItemById;
const createFoodItem = async (req, res) => {
    try {
        const foodItem = new FoodItem_1.FoodItem(req.body);
        await foodItem.save();
        res.status(201).json({ message: 'Food item created successfully', foodItem });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createFoodItem = createFoodItem;
const updateFoodItem = async (req, res) => {
    try {
        // Get the current item first to check if it exists
        const currentItem = await FoodItem_1.FoodItem.findById(req.params.id);
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
        const foodItem = await FoodItem_1.FoodItem.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true, upsert: false });
        console.log('Updated food item result:', {
            name: foodItem?.name,
            stock: foodItem?.stock,
            maxDailyStock: foodItem?.maxDailyStock
        });
        res.json({ message: 'Food item updated successfully', foodItem });
    }
    catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateFoodItem = updateFoodItem;
const deleteFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem_1.FoodItem.findByIdAndDelete(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteFoodItem = deleteFoodItem;
// Migration endpoint to fix existing items without stock fields
const migrateFoodItemsEndpoint = async (req, res) => {
    try {
        console.log('🔄 Migration endpoint called');
        const success = await (0, migration_1.migrateFoodItems)();
        if (success) {
            res.status(200).json({ message: 'Migration completed successfully' });
        }
        else {
            res.status(500).json({ message: 'Migration failed' });
        }
    }
    catch (error) {
        console.error('Migration endpoint error:', error);
        res.status(500).json({ message: 'Migration failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.migrateFoodItemsEndpoint = migrateFoodItemsEndpoint;
//# sourceMappingURL=foodController.js.map