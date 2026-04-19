"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
function requireAuth(req, res, next) {
    const token = req.cookies?.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    try {
        const { userId } = (0, jwt_1.verifyAccessToken)(token);
        req.userId = userId;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}
