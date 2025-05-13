"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const { combine, timestamp, printf, colorize } = winston_2.format;
// Define your custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});
// Create the logger instance
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: combine(timestamp(), logFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), logFormat)
        })
    ]
});
// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        exports.logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
