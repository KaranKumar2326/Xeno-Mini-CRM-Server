"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/delivery.routes.ts
const express_1 = require("express");
const delivery_controller_1 = require("../controllers/delivery.controller");
const router = (0, express_1.Router)();
router.post('/receipt', delivery_controller_1.deliveryReceiptValidator, delivery_controller_1.handleDeliveryReceipt);
exports.default = router;
