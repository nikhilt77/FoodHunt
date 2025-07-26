"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Auth routes
router.post('/register', authController_1.authValidation.register, authController_1.register);
router.post('/login', authController_1.authValidation.login, authController_1.login);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
// Payment routes  
router.post('/payments', auth_1.authenticate, paymentController_1.createPayment);
router.get('/payments', auth_1.authenticate, paymentController_1.getUserPayments);
router.get('/payments/all', auth_1.authenticate, (0, auth_1.authorize)('admin'), paymentController_1.getAllPayments);
router.get('/balance', auth_1.authenticate, paymentController_1.getUserBalance);
router.get('/dues', auth_1.authenticate, paymentController_1.getUserDues);
// Admin only routes
router.post('/add-balance/:userId?', auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'), authController_1.addBalance);
exports.default = router;
//# sourceMappingURL=auth.js.map