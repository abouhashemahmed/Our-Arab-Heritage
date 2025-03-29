// src/routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import createError from "http-errors";
import Joi from "joi";
import { prisma } from "../utils/prisma.js";
import { rateLimit } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import axios from "axios";
import UAParser from "ua-parser-js";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || "7d";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";
const RP_NAME = process.env.WEBAUTHN_RP_NAME || "Our Arab Heritage";
const WEBAUTHN_ORIGIN = process.env.WEBAUTHN_ORIGIN || `https://${RP_ID}`;

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

const rateLimitConfig = {
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "authLimit:"
  }),
  standardHeaders: true,
  legacyHeaders: false,
  message: createError.TooManyRequests("Too many attempts")
};

const endpointSpecificLimits = {
  register: rateLimit({ ...rateLimitConfig, windowMs: 864e5, max: 5 }),
  login: rateLimit({ ...rateLimitConfig, windowMs: 360e3, max: 10 }),
  webauthn: rateLimit({ ...rateLimitConfig, windowMs: 180e3, max: 15 })
};

router.use((req, res, next) => {
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("Content-Security-Policy", "default-src 'self'");
  next();
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
    })
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
}).unknown(false);

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return next(createError.BadRequest(error.details[0].message));

  req.tokenBinding = {
    ip: req.headers['x-forwarded-for'] || req.ip,
    uaHash: crypto.createHash('sha256').update(req.headers['user-agent']).digest('hex'),
    userAgent: new UAParser(req.headers['user-agent']).getResult()
  };

  next();
};

const logSecurityEvent = async (event) => {
  await prisma.auditLog.create({
    data: {
      userId: event.userId,
      type: event.type,
      ipAddress: event.ip,
      userAgentHash: event.uaHash,
      metadata: event.metadata
    }
  });

  if (process.env.SECURITY_ALERT_WEBHOOK) {
    await axios.post(process.env.SECURITY_ALERT_WEBHOOK, {
      text: `🔐 Security Event: ${event.type} for user ${event.userId}\nIP: ${event.ip}\nUA: ${event.userAgent.browser.name} on ${event.userAgent.os.name}`
    });
  }
};

const generateTokens = (user, req) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      binding: req.tokenBinding
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      binding: req.tokenBinding
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

const validateTokenBinding = (req) => {
  const decoded = jwt.verify(req.token, JWT_SECRET);
  if (decoded.binding.uaHash !== req.tokenBinding.uaHash) {
    throw createError.Unauthorized("Session context mismatch");
  }
  return decoded;
};

// Additional WebAuthn, login, refresh, logout, etc. would be built on top of this base.

export default router;
