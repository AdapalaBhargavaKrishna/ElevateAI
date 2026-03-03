import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from './routes/auth.routes';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});