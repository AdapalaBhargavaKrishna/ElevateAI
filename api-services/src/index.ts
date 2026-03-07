import dotenv from "dotenv";
dotenv.config()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./utils/passport";

import authRoutes from "./routes/auth.routes";
import userInfoRoutes from "./routes/userInfo.routes";

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/user-info", userInfoRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});