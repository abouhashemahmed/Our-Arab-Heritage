require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

console.log("🚀 Starting server...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded ✅" : "Not Found ❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded ✅" : "Not Found ❌");
console.log("🔍 Stripe API Key in Use:", process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// ✅ Proper CORS Setup
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log(`📥 Incoming request: ${req.method} ${req.url}`);
    next();
});

// ✅ Middleware to Protect Routes
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No authorization header found.");
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("🟢 Token successfully verified:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Invalid Token:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("✅ Backend is running!");
});

// ✅ Register User
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const validRoles = ["BUYER", "SELLER", "ADMIN"]; // Match your Prisma enum
        const formattedRole = role.toUpperCase();
        
        if (!validRoles.includes(formattedRole)) {
            return res.status(400).json({ error: "Invalid role provided" });
        }
        
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: formattedRole, // Ensure role matches enum
            },
        });
        
        

        res.json({ success: true, userId: newUser.id });
    } catch (error) {
        console.error("❌ Registration Error:", error.message, error.stack);
        // LOG THE ACTUAL ERROR
        res.status(500).json({ error: "Registration failed" });
    }
});


// ✅ User Login (JWT Authentication)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ success: true, token, email: user.email, role: user.role });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// ✅ Get All Products
app.get("/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        console.log("🛍️ Debug: Products Fetched →", JSON.stringify(products, null, 2)); // ✅ Debugging Line
        res.json(products);
    } catch (error) {
        console.error("❌ Fetching Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});



// ✅ Get a Single Product by ID
app.get("/products/:id", async (req, res) => {
    const { id } = req.params;
    console.log("🔍 Requested Product ID:", id); // Debugging Log

    try {
        const product = await prisma.product.findUnique({
            where: { id: id }, // Ensure this matches your database field type
        });

        if (!product) {
            console.log("❌ Product Not Found!");
            return res.status(404).json({ error: "Product not found" });
        }

        console.log("✅ Product Found:", product);
        res.json(product);
    } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});



// ✅ Fetch Logged-in User Info
app.get("/me", authenticateUser, async (req, res) => {
    try {
        console.log("🟢 Fetching user data for:", req.user.userId);

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            console.log("❌ User not found in database.");
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("❌ Error fetching user info:", error);
        res.status(500).json({ error: "Failed to fetch user info" });
    }
});

// ✅ Stripe Checkout API Route
app.post("/checkout", async (req, res) => {
    try {
        const { cart } = req.body;
        console.log("🛒 Incoming cart data:", cart);

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const line_items = cart.map(item => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.title },
                unit_amount: Math.round(item.price * 100), // Convert price to cents
            },
            quantity: item.quantity || 1,
        }));

        console.log("🛠️ Stripe Line Items:", line_items);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cart",
        });

        console.log("✅ Stripe Session Created:", session);
        res.json({ id: session.id, url: session.url });

    } catch (error) {
        console.error("❌ Stripe API Error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});


// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
