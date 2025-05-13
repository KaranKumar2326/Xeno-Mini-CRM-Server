"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.get('/google', (req, res) => {
    console.log('Google auth route hit');
    (0, auth_controller_1.googleAuth)(req, res);
});
router.get('/google/callback', (req, res) => {
    console.log('Google callback route hit');
    (0, auth_controller_1.googleCallback)(req, res);
});
exports.default = router;
