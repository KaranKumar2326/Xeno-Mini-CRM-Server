import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import Order from '../models/Order';
import { validateOrder } from '../validations/order.validation';
import { generateTrackingId } from '../utils/tracking';

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validationResult = validateOrder(req.body);
    if (validationResult.error) {
      res.status(400).json({ error: validationResult.error.message });
      return;
    }

    const trackingId = generateTrackingId();
    const orderPayload = {
      ...req.body,
      trackingId,
      status: 'processing',
      createdAt: new Date()
    };

    await redisClient.publish('new-orders', JSON.stringify(orderPayload));

    res.status(202).json({
      message: 'Order accepted for processing',
      trackingId,
      _links: {
        status: `/api/orders/status/${trackingId}`,
        cancel: `/api/orders/${trackingId}/cancel`
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    type OrderWithTimestamps = {
      status: string;
      customerId: string;
      amount: number;
      updatedAt: Date;
    };

    const order = await Order.findOne({ trackingId: req.params.trackingId }) as OrderWithTimestamps | null;

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({
      status: order.status,
      customerId: order.customerId,
      amount: order.amount,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(filter)
    ]);

    res.json({
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOneAndUpdate(
      { trackingId: req.params.trackingId, status: 'pending' },
      { status: 'failed', cancellationReason: 'User requested' },
      { new: true }
    );

    if (!order) {
      res.status(400).json({ error: 'Order cannot be canceled' });
      return;
    }

    res.json({ message: 'Order canceled', status: order.status });
  } catch (error) {
    next(error);
  }
};
