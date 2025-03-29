// src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";
import pinoHttp from "pino-http";
import createError from "http-errors";
import xssClean from "xss-clean";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import { connectWithRetry } from "./utils/database.js";

// Config
import { CLOUDINARY_CONFIG, SECURITY_HEADERS } from "./config.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

// Logger
import logger from "./utils/logger.js";

// Init
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// 🔐 Environment Validation
[
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
].forEach((key) => {
  if (!process.env[key]) throw new Error(`❌ Missing ${key} in .env`);
});

// 🛠️ Prisma Configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL +
        (process.env.NODE_ENV === "production" ? "?connection_limit=10" : "")
    }
  }
});

// 📦 Middleware Stack
app.use(pinoHttp({
  logger,
  genReqId: (req) => {
    req.id = randomUUID();
    return req.id;
  }
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      ...SECURITY_HEADERS.csp
    }
  },
  hsts: SECURITY_HEADERS.hsts
}));

app.use(xssClean());
app.disable("x-powered-by");

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));
app.options("*", cors());

// ⚡ Rate Limiting & Redis
const redisClient = process.env.NODE_ENV === "production"
  ? createClient({ 
      url: process.env.REDIS_URL,
      pingInterval: 60_000
    })
  : null;

if (redisClient) {
  redisClient.on("error", (err) => logger.error("Redis error:", err));
  await redisClient.connect();
}

const apiLimiter = rateLimit({
  store: process.env.NODE_ENV === "production"
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: "rl:"
      })
    : new rateLimit.MemoryStore(),
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: createError.TooManyRequests("Too many requests. Try again later.")
});

// ➕ Optional TTL tracking for Redis rate-limit keys (future-ready)
// await redisClient.sendCommand(['EXPIRE', key, ttlInSeconds]);

// 🚪 Application Routes
app.get("/", (req, res) => {
  res.json({
    service: "Our Arab Heritage API",
    status: "operational",
    documentation: process.env.API_DOCS_URL || "https://docs.example.com"
  });
});

app.get("/version", (req, res) => {
  res.json({
    name: "our-arab-heritage-api",
    version: process.env.npm_package_version || require("../package.json").version,
    environment: process.env.NODE_ENV || "development"
  });
});

app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/orders", apiLimiter, orderRoutes);
app.use("/api/products", productRoutes);

// 🩺 Health & Metrics
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      requestId: req.id,
      status: "ok",
      version: process.env.npm_package_version || "dev",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    req.log.error("Database health check failed:", err);
    res.status(503).json({
      requestId: req.id,
      status: "database_unavailable"
    });
  }
});

app.get("/metrics/rate-limits", async (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    try {
      const keys = await redisClient?.sendCommand(["KEYS", "rl:*"]) || [];
      const metrics = await Promise.all(keys.map(async (key) => ({
        key,
        count: await redisClient.sendCommand(["GET", key])
      })));
      res.json(metrics);
    } catch (err) {
      res.status(500).json({ error: "Metrics unavailable" });
    }
  } else {
    res.status(404).end();
  }
});

// 🛑 Error Handling
app.use((req, res, next) => {
  next(createError.NotFound("Route not found"));
});

app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(err.status || 500).json({
    error: {
      requestId: req.id,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
});

// 🔌 Graceful Shutdown
let server;
const shutdown = async (signal) => {
  logger.info(`🛑 ${signal} received. Closing server...`);
  try {
    server?.close();
    await Promise.all([
      prisma.$disconnect(),
      redisClient?.quit()
    ]);
  } catch (err) {
    logger.error("Shutdown error:", err);
  } finally {
    process.exit(0);
  }
};

["SIGINT", "SIGTERM"].forEach((sig) =>
  process.on(sig, () => shutdown(sig))
);

// 🚀 Server Initialization
connectWithRetry(prisma)
  .then(() => {
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`
      ██████╗ ██╗   ██╗██████╗  ██████╗ 
      ██╔══██╗██║   ██║██╔══██╗██╔═══██╗
      ██████╔╝██║   ██║██████╔╝██║   ██║
      ██╔══██╗██║   ██║██╔══██╗██║   ██║
      ██║  ██║╚██████╔╝██║  ██║╚██████╔╝
      ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ 
      `);
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    logger.fatal("❌ Startup failed:", err);
    process.exit(1);
  });

export default app;


