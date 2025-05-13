"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.listOrders = exports.getOrderStatus = exports.createOrder = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const Order_1 = __importDefault(require("../models/Order"));
const order_validation_1 = require("../validations/order.validation");
const tracking_1 = require("../utils/tracking");
const createOrder = async (req, res, next) => {
    try {
        const validationResult = (0, order_validation_1.validateOrder)(req.body);
        if (validationResult.error) {
            res.status(400).json({ error: validationResult.error.message });
            return;
        }
        const trackingId = (0, tracking_1.generateTrackingId)();
        const orderPayload = {
            ...req.body,
            trackingId,
            status: 'processing',
            createdAt: new Date()
        };
        await redis_1.default.publish('new-orders', JSON.stringify(orderPayload));
        res.status(202).json({
            message: 'Order accepted for processing',
            trackingId,
            _links: {
                status: `/api/orders/status/${trackingId}`,
                cancel: `/api/orders/${trackingId}/cancel`
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrderStatus = async (req, res, next) => {
    try {
        const order = await Order_1.default.findOne({ trackingId: req.params.trackingId });
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderStatus = getOrderStatus;
const listOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.customerId)
            filter.customerId = req.query.customerId;
        if (req.query.status)
            filter.status = req.query.status;
        const [orders, total] = await Promise.all([
            Order_1.default.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Order_1.default.countDocuments(filter)
        ]);
        res.json({
            data: orders,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listOrders = listOrders;
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order_1.default.findOneAndUpdate({ trackingId: req.params.trackingId, status: 'pending' }, { status: 'failed', cancellationReason: 'User requested' }, { new: true });
        if (!order) {
            res.status(400).json({ error: 'Order cannot be canceled' });
            return;
        }
        res.json({ message: 'Order canceled', status: order.status });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
