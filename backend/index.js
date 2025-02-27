require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // ✅ Ensure this is using the key from .env

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

console.log("🚀 Starting server...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded ✅" : "Not Found ❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded ✅" : "Not Found ❌");

const app = express();
app.use(express.json());

// ✅ Proper CORS Setup
const corsOptions = {
    origin: '*', // Allows all frontend requests during development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log(`📥 Incoming request: ${req.method} ${req.url}`);
    next();
});

// ✅ Test Route
app.get('/', (req, res) => {
    res.send('✅ Backend is running!');
});

// ✅ Middleware to Protect Routes
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// ✅ Register User (with hashed password)
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword, role },
        });

        res.json({ success: true, userId: newUser.id });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// ✅ User Login (JWT Authentication)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ✅ Get All Products
app.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("❌ Fetching Products Error:", error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ✅ Get a Single Product by ID
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error("❌ Fetching Product Error:", error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// ✅ Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { cart } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const line_items = cart.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.title },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",

        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("❌ Stripe Error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// ✅ Fetch Logged-in User Data
app.get("/user", authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { email: true, role: true },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});


// ✅ Check if User is Logged In
app.get("/me", authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("❌ Error fetching user info:", error);
        res.status(500).json({ error: "Failed to fetch user info" });
    }
});

