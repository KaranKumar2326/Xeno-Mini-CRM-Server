"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingId = void 0;
const generateTrackingId = () => {
    return 'TRK-' +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase();
};
exports.generateTrackingId = generateTrackingId;
