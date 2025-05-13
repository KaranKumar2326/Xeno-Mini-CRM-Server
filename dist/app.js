"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./src/config/db");
const redis_1 = require("./src/config/redis");
const customer_routes_1 = __importDefault(require("./src/routes/customer.routes"));
const order_routes_1 = __importDefault(require("./src/routes/order.routes"));
const campaign_routes_1 = __importDefault(require("./src/routes/campaign.routes"));
const delivery_routes_1 = __importDefault(require("./src/routes/delivery.routes"));
const error_1 = require("./src/middlewares/error");
const redis_consumer_1 = require("./src/services/redis.consumer");
// import { startCampaignWorker } from './src/workers/campaign.worker';
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./src/config/swagger");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("./src/workers/campaign.worker");
const logger_1 = require("./src/middlewares/logger");
const segment_routes_1 = __importDefault(require("./src/routes/segment.routes"));
// import mockVendor from './src/api/mock-vendor';
const mock_vendor_1 = __importDefault(require("./src/api/mock-vendor"));
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const passport_1 = __importDefault(require("passport"));
require("./src/config/passport"); // Import the Passport configuration
const express_session_1 = __importDefault(require("express-session"));
// import cors from 'cors';
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use((0, cors_1.default)({
    origin: 'localhost:3000', // Allow requests from the frontend (localhost:3000)
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
    credentials: true, // Allow cookies and credentials if needed
}));
app.use(express_1.default.json());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Request Parsing
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
app.use(logger_1.requestLogger);
// API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(passport_1.default.initialize());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Secret key for encryption
    resave: false,
    saveUninitialized: true,
}));
// app.use(passport.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/customers', customer_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/campaigns', campaign_routes_1.default);
app.use('/api/delivery', delivery_routes_1.default);
app.use('/api/segments', segment_routes_1.default);
// app.use('/api', require('./api/mock-vendor'));
// app.use('/api/mock-vendor', mockVendorRouter);
app.use('/api', mock_vendor_1.default);
app.use('/auth', auth_routes_1.default);
// Health Check
app.get('/ping', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Error Handling (Must be last middleware)
app.use(error_1.errorHandler);
// Start Server
const start = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, redis_1.initRedis)();
        // Start background workers
        (0, redis_consumer_1.startOrderConsumer)();
        // startCampaignWorker();
        app.listen(PORT, () => {
            console.log(`
      🚀 Server ready at http://localhost:${PORT}
      📚 API Docs: http://localhost:${PORT}/api-docs
      `);
        });
    }
    catch (err) {
        console.error('Server startup failed:', err);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
start();
