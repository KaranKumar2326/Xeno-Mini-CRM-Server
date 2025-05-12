// src/routes/delivery.routes.ts
import { Router } from 'express';
import { handleDeliveryReceipt, deliveryReceiptValidator } from '../controllers/delivery.controller';

const router = Router();

router.post('/receipt', deliveryReceiptValidator, handleDeliveryReceipt);

export default router;