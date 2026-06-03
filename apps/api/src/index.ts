import { env } from "./config/env";
import app from "./app";
import { logger } from "./utils/logger";
import { db } from "@innuentha/supabase/db";
import { EventWorker } from "./worker/events.worker";
import * as Sentry from "@sentry/node";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
  logger.info("Sentry error tracking initialised");
}

logger.info("Initializing database connection validation...");
if (db) {
  logger.info("Shared Supabase database module loaded successfully.");
}

const worker = new EventWorker();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  worker.start();
});

// Graceful Shutdown handling
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  worker.stop();

  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown fails
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, _promise) => {
  logger.error("Unhandled Rejection at:", reason instanceof Error ? reason : undefined);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

