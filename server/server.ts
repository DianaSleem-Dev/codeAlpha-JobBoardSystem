import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.routes";
import candidateRoutes from "./routes/candidate.routes";
import employerRoutes from "./routes/employer.routes";
import categoryRoutes from "./routes/category.routes";
import jobRoutes from "./routes/job.routes";
import resumeRoutes from "./routes/resume.routes";
import jobApplicationRoutes from "./routes/job-application.routes";
import statsRoutes from "./routes/stats.routes";
// Middlewares
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { setupSwagger, swaggerSpec } from "./config/swagger";

// Socket
import { Server } from "socket.io";
import { initWebSocket } from "./config/websocket";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use("/uploads", express.static("uploads"));

const API_PREFIX = "/api/v1";

// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/candidate`, candidateRoutes);
app.use(`${API_PREFIX}/employer`, employerRoutes);
app.use(`${API_PREFIX}/category`, categoryRoutes);
app.use(`${API_PREFIX}/job`, jobRoutes);
app.use(`${API_PREFIX}/resume`, resumeRoutes);
app.use(`${API_PREFIX}/job-application`, jobApplicationRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);
// Swagger
setupSwagger(app);

app.get("/api-docs-json", (req, res) => {
  res.json(swaggerSpec);
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER + SOCKET =================
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    // HTTP server
    const server = http.createServer(app);

    // Socket.IO
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    // init websocket logic
    initWebSocket(io);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};

startServer();

export default app;