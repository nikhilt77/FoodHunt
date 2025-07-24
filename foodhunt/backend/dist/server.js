"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const food_1 = __importDefault(require("./routes/food"));
const admin_1 = __importDefault(require("./routes/admin"));
const orders_1 = __importDefault(require("./routes/orders"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const dues_1 = __importDefault(require("./routes/dues"));
const validation_1 = require("./middleware/validation");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:3007',
        'http://localhost:3008',
        'http://localhost:3009',
        'http://localhost:3010'
    ],
    credentials: true
}));
// Logging middleware
app.use((0, morgan_1.default)('combined'));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/food', food_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/api/dues', dues_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'FoodHunt API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Error handling middleware
app.use(validation_1.errorHandler);
// Database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('🔍 MongoDB URI from env:', mongoUri);
        console.log('🔍 All env variables:', Object.keys(process.env).filter(key => key.includes('MONGODB')));
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database name:', mongoose_1.default.connection.name);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📖 API docs available at http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await mongoose_1.default.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map