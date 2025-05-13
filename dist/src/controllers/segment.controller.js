"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRules = exports.evaluateSegment = void 0;
const express_validator_1 = require("express-validator");
const segment_service_1 = require("../services/segment.service");
const evaluateSegment = async (req, res) => {
    try {
        // Normalize input (handle both wrapped and direct rules)
        console.log('🔥 Raw req.body:', JSON.stringify(req.body, null, 2));
        const result = await segment_service_1.SegmentService.evaluateRules(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({
            error: 'Evaluation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.evaluateSegment = evaluateSegment;
exports.validateRules = [
    // Accept either { rules: { condition, rules[] }} or direct { condition, rules[] }
    (0, express_validator_1.body)().custom(body => {
        if (!body.rules && !body.condition) {
            throw new Error('Must provide either rules object or direct rules');
        }
        return true;
    }),
    // Validate condition when present
    (0, express_validator_1.body)('condition').optional().isIn(['AND', 'OR']).withMessage('Condition must be AND or OR'),
    (0, express_validator_1.body)('rules.condition').optional().isIn(['AND', 'OR']).withMessage('Condition must be AND or OR'),
    // Validate rules array
    (0, express_validator_1.body)('rules.rules').optional().isArray({ min: 1 }),
    (0, express_validator_1.body)().customSanitizer(body => {
        if ('rules' in body && 'condition' in body.rules) {
            return body.rules; // Nested format
        }
        else if ('condition' in body && 'rules' in body) {
            return body; // Direct format
        }
        return body;
    })
];
