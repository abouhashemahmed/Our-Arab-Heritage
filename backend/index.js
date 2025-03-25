require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// 🧠 Log App Version
console.log(`✅ API Starting | Version: ${process.env.npm_package_version}`);
console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);

// 🔒 Validation Schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().min(0.01).required(),
  country: Joi.string().min(2).max(50).required()
});

// ⚡ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later."
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// 🛠️ Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.options("*", cors());

// 📝 Advanced Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 🧼 Input Sanitization Middleware
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
});

// 📁 File Upload Config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed."));
    }
    cb(null, true);
  }
});

// 🔑 Auth Middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ error: "Invalid user" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 👥 Register
app.post("/register", apiLimiter, async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const sanitizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { 
        email: sanitizedEmail, 
        password: hashedPassword, 
        role: "BUYER" 
      }
    });

    res.status(201).json({ success: true, userId: newUser.id, email: newUser.email });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 🔐 Login
app.post("/login", apiLimiter, async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        createdAt: user.createdAt,
        lastLogin: updatedUser.lastLogin
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🔐 /me - Authenticated User Info
app.get("/me", authenticateUser, (req, res) => {
  const { id, email, role, createdAt, updatedAt, lastLogin } = req.user;
  res.json({ id, email, role, createdAt, updatedAt, lastLogin });
});

// 🛒 Add Product
app.post("/add-product", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(403).json({ error: "Seller account required" });
    }

    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, description, price, country } = req.body;
    let imageUrl = null;

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();
    const sanitizedCountry = country.trim();

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "products",
            allowed_formats: ["jpg", "jpeg", "png"],
            transformation: [{ width: 800, height: 600, crop: "limit" }]
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      imageUrl = uploadResult.secure_url;
    }

    const product = await prisma.product.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        price: parseFloat(price),
        country: sanitizedCountry,
        images: imageUrl ? [imageUrl] : [],
        sellerId: req.user.id
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ error: "Product creation failed" });
  }
});

// 🏥 Health Check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      database: "connected",
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      database: "disconnected",
      error: error.message
    });
  }
});

// 🧭 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 🚨 Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`🚨 Error: ${err.stack}`);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// 🔌 Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// 🚀 Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
});

