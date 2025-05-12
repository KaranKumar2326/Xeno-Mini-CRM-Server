import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db';
import { initRedis } from './src/config/redis';
import customerRoutes from './src/routes/customer.routes';
import orderRoutes from './src/routes/order.routes';
import campaignRoutes from './src/routes/campaign.routes';
import deliveryRoutes from './src/routes/delivery.routes';
import { errorHandler } from './src/middlewares/error';
import { startOrderConsumer } from './src/services/redis.consumer';
// import { startCampaignWorker } from './src/workers/campaign.worker';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import "./src/workers/campaign.worker";
import { requestLogger } from './src/middlewares/logger';
import segmentRoutes from './src/routes/segment.routes';
// import mockVendor from './src/api/mock-vendor';
import mockVendorRouter from './src/api/mock-vendor';
import authRoutes from './src/routes/auth.routes';

import passport from 'passport';
import './src/config/passport'; // Import the Passport configuration

// import cors from 'cors';



dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*'
}));

app.use(cors({
  origin: 'localhost:3000',  // Allow requests from the frontend (localhost:3000)
  methods: ['GET', 'POST','OPTIONS'],        // Allow specific methods
  credentials: true,                // Allow cookies and credentials if needed
}));
app.use(express.json());
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// API Documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec)
);
app.use(passport.initialize());
// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/segments', segmentRoutes);
// app.use('/api', require('./api/mock-vendor'));
// app.use('/api/mock-vendor', mockVendorRouter);
app.use('/api', mockVendorRouter);
app.use('/api/auth', authRoutes); 





// Health Check
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error Handling (Must be last middleware)
app.use(errorHandler);

// Start Server
const start = async () => {
  try {
    await connectDB();
    await initRedis();
    
    // Start background workers
    startOrderConsumer();
    // startCampaignWorker();
    
    app.listen(PORT, () => {
      console.log(`
      🚀 Server ready at http://localhost:${PORT}
      📚 API Docs: http://localhost:${PORT}/api-docs
      `);
    });
  } catch (err) {
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