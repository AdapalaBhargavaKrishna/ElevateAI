"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("./prisma");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos?.[0]?.value;
        if (!email) {
            return done(new Error("No email from Google"), undefined);
        }
        // Check if user exists
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (user && user.provider === "local") {
            return done(new Error("EMAIL_EXISTS_LOCAL"), undefined);
        }
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    fullName,
                    googleId,
                    avatar,
                    provider: "google",
                },
            });
        }
        return done(null, user);
    }
    catch (err) {
        return done(err, undefined);
    }
}));
exports.default = passport_1.default;
