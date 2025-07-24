"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authController_1.authValidation.register, validation_1.validateRequest, authController_1.register);
router.post('/login', authController_1.authValidation.login, validation_1.validateRequest, authController_1.login);
// Protected routes
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
// Admin/Staff routes
router.post('/add-balance/:userId?', auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'), authController_1.addBalance);
exports.default = router;
//# sourceMappingURL=auth.js.map