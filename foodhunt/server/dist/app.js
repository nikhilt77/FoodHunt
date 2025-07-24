"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const stockRoutes_1 = __importDefault(require("./routes/stockRoutes"));
const reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const auth_1 = require("./middleware/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to database
(0, database_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', userRoutes_1.default);
app.use('/api/food-items', auth_1.authenticate, stockRoutes_1.default);
app.use('/api/reservations', auth_1.authenticate, reservationRoutes_1.default);
app.use('/api/payments', auth_1.authenticate, paymentRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map