"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaignDetails = exports.getCampaigns = exports.createCampaign = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
const createCampaign = async (req, res) => {
    try {
        const campaign = new Campaign_1.default(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createCampaign = createCampaign;
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign_1.default.find().sort({ createdAt: -1 });
        res.json(campaigns);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCampaigns = getCampaigns;
const getCampaignDetails = async (req, res) => {
    try {
        const campaign = await Campaign_1.default.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(campaign);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCampaignDetails = getCampaignDetails;
