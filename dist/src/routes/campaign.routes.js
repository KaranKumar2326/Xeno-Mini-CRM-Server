"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Explicitly type the route handlers to void
router.post('/', auth_middleware_1.requireAuth, (req, res, next) => {
    (0, campaign_controller_1.createCampaign)(req, res)
        .then(() => { })
        .catch(error => {
        next(error);
    });
});
router.get('/', auth_middleware_1.requireAuth, (req, res, next) => {
    (0, campaign_controller_1.getCampaigns)(req, res)
        .then(() => { })
        .catch(error => {
        next(error);
    });
});
router.get('/:id', auth_middleware_1.requireAuth, (req, res, next) => {
    (0, campaign_controller_1.getCampaignDetails)(req, res)
        .then(() => { })
        .catch(error => {
        next(error);
    });
});
exports.default = router;
