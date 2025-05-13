"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.createCustomer = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.create(req.body);
        res.status(201).json(customer);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        next(error);
    }
};
exports.createCustomer = createCustomer;
const getCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [customers, count] = await Promise.all([
            Customer_1.default.find().skip(skip).limit(limit),
            Customer_1.default.countDocuments()
        ]);
        res.json({
            data: customers,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id);
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer_1.default.findByIdAndDelete(req.params.id);
        if (!customer) {
            res.status(404).json({ error: "Customer not found" });
            return;
        }
        res.json({ message: "Customer deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
