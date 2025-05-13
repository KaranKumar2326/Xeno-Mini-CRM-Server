"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/mock-vendor', (req, res) => {
    const isSuccess = Math.random() < 0.9; // 90% success rate
    setTimeout(() => {
        res.status(200).json({
            success: isSuccess,
            messageId: require('crypto').randomBytes(16).toString('hex')
        });
    }, 100 + Math.random() * 400); // Simulate latency
});
exports.default = router;
