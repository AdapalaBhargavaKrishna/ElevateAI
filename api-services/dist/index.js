"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("./utils/passport"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const userInfo_routes_1 = __importDefault(require("./routes/userInfo.routes"));
const resume_routes_1 = __importDefault(require("./routes/resume.routes"));
const roadmap_routes_1 = __importDefault(require("./routes/roadmap.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
            .split(",")
            .map(o => o.trim())
            .filter(Boolean);
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            console.error(`[CORS] Blocked origin: ${origin}`);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use("/auth", auth_routes_1.default);
app.use("/interview", interview_routes_1.default);
app.use("/user-info", userInfo_routes_1.default);
app.use("/resume", resume_routes_1.default);
app.use("/roadmap", roadmap_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
