"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const foodController_1 = require("../controllers/foodController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes (for browsing menu)
router.get('/', foodController_1.getAllFoodItems);
router.get('/:id', foodController_1.getFoodItemById);
// Admin/Staff routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'), foodController_1.foodValidation.create, validation_1.validateRequest, foodController_1.createFoodItem);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'), foodController_1.updateFoodItem);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'), foodController_1.deleteFoodItem);
router.post('/migrate', auth_1.authenticate, (0, auth_1.authorize)('admin'), foodController_1.migrateFoodItemsEndpoint);
exports.default = router;
//# sourceMappingURL=food.js.map