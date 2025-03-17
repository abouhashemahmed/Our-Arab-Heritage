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

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("🚀 Starting server...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded ✅" : "Not Found ❌");
console.log("JWT_SECRET:", JWT_SECRET ? "Loaded ✅" : "Not Found ❌");
console.log("Cloudinary Config:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ Not Found");

const app = express();
app.use(express.json());

// ✅ CORS Setup
app.use(cors({ origin: "*", credentials: true }));

// ✅ Middleware to log requests
app.use((req, res, next) => {
    console.log(`📥 Incoming request: ${req.method} ${req.url}`);
    next();
});

// ✅ Multer Setup for Memory Storage (needed for Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Middleware to Protect Routes
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

// ✅ Route: Register User
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const formattedRole = role.toUpperCase();

        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, role: formattedRole },
        });

        res.json({ success: true, userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// ✅ Route: User Login (JWT Authentication)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ success: true, token, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

// ✅ Route: Get All Products
app.get("/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// ✅ Route: Get Single Product by ID
app.get("/products/:id", async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

// ✅ Route: Add Product (With Cloudinary Support)
app.post("/add-product", authenticateUser, upload.single("image"), async (req, res) => {
    try {
        console.log("📥 Incoming request:", req.body);
        const { title, description, price, country } = req.body;

        if (!title || !description || !price || !country) {
            return res.status(400).json({ error: "All fields are required." });
        }

        let imageUrl = null;

        // ✅ Upload image to Cloudinary (if provided)
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: "products" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
            imageUrl = uploadResult.secure_url;
        }

        // ✅ Create Product in Database
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                country,
                images: imageUrl ? [imageUrl] : [],
                sellerId: req.user.userId,
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});
app.get("/", (req, res) => {
    res.send("✅ Backend is running!");
});


// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
