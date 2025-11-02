import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import cors from "cors";
import { config } from "dotenv";
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const corsOptions = {
    origin: [process.env.ALLOWED_SITE],
    credentials: true
};

app.use(cors(corsOptions));

// Health check endpoints
app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
import aiRouter from "./routes/ai.routes.js";
app.use("/api/ai", aiRouter);

export default app;
