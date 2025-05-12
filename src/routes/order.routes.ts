import { Router } from 'express';
import {
  createOrder,
  getOrderStatus,
  listOrders,
  cancelOrder
} from '../controllers/order.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order processing with Redis pub-sub
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           example: 5f8d04b3ab35de3a342779d0
 *         name:
 *           type: string
 *           example: Premium Widget
 *         price:
 *           type: number
 *           example: 19.99
 *         quantity:
 *           type: number
 *           example: 2
 *
 *     Order:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *         - amount
 *         - status
 *         - trackingId
 *       properties:
 *         customerId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         amount:
 *           type: number
 *           example: 59.98
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: 123 Main St
 *             city:
 *               type: string
 *               example: New York
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: processing
 *         trackingId:
 *           type: string
 *           example: TRK-MAI8X7KYPDDQ
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-05-10T13:19:36.270Z
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (async)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       202:
 *         description: Order accepted for processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error (e.g., missing customerId or items)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Items are required"
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders/status/{trackingId}:
 *   get:
 *     summary: Get order status by tracking ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique tracking ID of the order
 *     responses:
 *       200:
 *         description: Order status and details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 */
router.get('/status/:trackingId', getOrderStatus);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get paginated list of orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page for pagination
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 */
router.get('/', listOrders);

/**
 * @swagger
 * /api/orders/{trackingId}/cancel:
 *   post:
 *     summary: Cancel a pending order by tracking ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tracking ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancellation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order canceled successfully"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 */
router.post('/:trackingId/cancel', cancelOrder);

export default router;
