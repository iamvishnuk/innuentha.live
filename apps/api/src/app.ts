import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { apiRouter } from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Logging middleware
if (process.env.NODE_ENV !== "test") {
  const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
  app.use(morgan(logFormat));
}

// Gzip compression
app.use(compression());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Centralized Router mounted at /api
app.use("/api", apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
