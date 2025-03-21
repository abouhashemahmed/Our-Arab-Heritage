require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🚀 Server Startup Logs
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Not Found ❌");
console.log("✅ JWT_SECRET:", JWT_SECRET ? "Loaded" : "Not Found ❌");
console.log("✅ Cloudinary Config:", process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "❌ Not Found");

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.options('*', cors()); // Add this line

// ✅ Log Incoming Requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ File Upload Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files (JPEG, PNG, etc.) are allowed."));
    }
    cb(null, true);
  }
});

// ✅ Authentication Middleware
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

// ✅ Register User
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({ data: { email, password: hashedPassword, role: "BUYER" } });

    res.status(201).json({ success: true, userId: newUser.id, email: newUser.email });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Add Product
app.post("/add-product", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "SELLER") return res.status(403).json({ error: "Seller account required" });

    const { title, description, price, country } = req.body;
    if (!title || !description || !price || !country) return res.status(400).json({ error: "All fields required" });

    if (isNaN(price) || parseFloat(price) <= 0) return res.status(400).json({ error: "Invalid price format" });

    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        country: country.trim(),
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

// ✅ Get All Products
app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Get Single Product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    res.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ✅ Root Route for Health Check
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend is running!" });
});

// ✅ Health Check Route
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Simple DB check
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.json({ status: "error", database: "disconnected", details: error.message });
  }
});


// ✅ Start Server
const PORT = process.env.PORT || 8080; // 👈 use 8080 instead of 4000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


// ✅ Periodically log that the server is still running (optional)
setInterval(() => console.log("✅ Server is still running..."), 60000);


