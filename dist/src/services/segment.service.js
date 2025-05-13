"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentService = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
class SegmentService {
    static async evaluateRules(inputRules) {
        try {
            // Normalize and validate input
            const rules = this.normalizeAndValidateInput(inputRules);
            // Build query and execute
            const query = this.buildMongoQuery(rules);
            const [count, sample] = await Promise.all([
                Customer_1.default.countDocuments(query),
                Customer_1.default.find(query).limit(5).lean()
            ]);
            return { count, sample, query };
        }
        catch (error) {
            console.error('Evaluation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Evaluation failed: ${errorMessage}`);
        }
    }
    static normalizeAndValidateInput(input) {
        if (input &&
            typeof input === 'object' &&
            'condition' in input &&
            'rules' in input &&
            Array.isArray(input.rules)) {
            // Input is a valid RuleGroup
            return input;
        }
        if (input &&
            typeof input === 'object' &&
            'rules' in input &&
            input.rules &&
            typeof input.rules === 'object' &&
            'condition' in input.rules &&
            'rules' in input.rules &&
            Array.isArray(input.rules.rules)) {
            // Input is nested like { rules: RuleGroup }
            return input.rules;
        }
        throw new Error('Invalid rule format: must include condition and rules');
    }
    static buildMongoQuery(rules) {
        const mapper = (r) => {
            if (typeof r !== 'object' || r === null) {
                throw new Error(`Invalid rule: ${JSON.stringify(r)}`);
            }
            return 'condition' in r ? this.buildMongoQuery(r) : this.buildCondition(r);
        };
        return rules.condition === 'AND'
            ? { $and: rules.rules.map(mapper) }
            : { $or: rules.rules.map(mapper) };
    }
    static buildCondition(rule) {
        this.validateField(rule.field);
        this.validateValueType(rule);
        const operator = this.normalizeOperator(rule.operator);
        return {
            [rule.field]: {
                [this.operatorMap[operator]]: this.parseValue(rule)
            }
        };
    }
    static normalizeOperator(op) {
        const operator = op.replace('\u003e', '>').replace('\u003c', '<');
        if (!this.operatorMap[operator]) {
            throw new Error(`Invalid operator: ${op}. Valid operators are: ${Object.keys(this.operatorMap).join(', ')}`);
        }
        return operator;
    }
    static parseValue(rule) {
        try {
            return rule.field.toLowerCase().includes('date')
                ? new Date(rule.value)
                : Number(rule.value);
        }
        catch (error) {
            throw new Error(`Failed to parse value for field ${rule.field}`);
        }
    }
    static validateField(field) {
        const validFields = ['totalSpend', 'visitCount', 'lastPurchase', 'lastVisit'];
        if (!validFields.includes(field)) {
            throw new Error(`Invalid field: ${field}. Valid fields are: ${validFields.join(', ')}`);
        }
    }
    static validateValueType(rule) {
        const isDateField = rule.field.toLowerCase().includes('date');
        if (isDateField) {
            const date = new Date(rule.value);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date value for field ${rule.field}. Received: ${rule.value}`);
            }
        }
        else {
            if (isNaN(Number(rule.value))) {
                throw new Error(`Invalid number value for field ${rule.field}. Received: ${rule.value}`);
            }
        }
    }
}
exports.SegmentService = SegmentService;
SegmentService.operatorMap = {
    '>': '$gt', '<': '$lt',
    '>=': '$gte', '<=': '$lte',
    '==': '$eq', '!=': '$ne'
    // '\u003e': '$gt', '\u003c': '$lt'  // Unicode support
};
