import dotenv from "dotenv";
dotenv.config()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./utils/passport";

import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";
import userInfoRoutes from "./routes/userInfo.routes";
import resumeRoutes from "./routes/resume.routes";
import roadmapRoutes from "./routes/roadmap.routes";
import chatRoutes from "./routes/chat.routes";

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: (origin, callback) => {
        const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
            .split(",")
            .map(o => o.trim())
            .filter(Boolean);
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`[CORS] Blocked origin: ${origin}`);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/user-info", userInfoRoutes);
app.use("/resume", resumeRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/chat", chatRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});