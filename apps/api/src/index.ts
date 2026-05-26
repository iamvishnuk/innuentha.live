import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { db } from "@innuentha/supabase/db";

// Test DB reference to verify that `@innuentha/supabase` module loads successfully.
// In actual routes/controllers, you can directly import { db } from "@innuentha/supabase/db" and run queries.
logger.info("Initializing database connection validation...");
if (db) {
  logger.info("Shared Supabase database module loaded successfully.");
}

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// Graceful Shutdown handling
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
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
