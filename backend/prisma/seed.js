const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Delete existing users and products before seeding (optional)
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a test user (seller)
    const seller = await prisma.user.create({
        data: {
            email: "seller@example.com",
            password: "securepassword", // Note: Hash this in a real project
            role: "SELLER",
            proSeller: true,
            membership: true,
        },
    });

    // Seed products
    await prisma.product.createMany({
        data: [
            {
                title: "Handcrafted Palestinian Ceramic Plate",
                description: "A beautifully handcrafted ceramic plate inspired by Palestinian traditional art.",
                price: 29.99,
                images: ["/images/palceramicplate.webp"], 
                sellerId: seller.id,
            },
            {
                title: "Olive Wood Cutting Board",
                description: "A durable and stylish olive wood cutting board, perfect for your kitchen.",
                price: 24.99,
                images: ["/images/olivecuttingboard.webp"],
                sellerId: seller.id,
            },
            {
                title: "Embroidered Palestinian Kufiya",
                description: "Authentic Palestinian kufiya with traditional embroidery.",
                price: 19.99,
                images: ["/images/keffiya.webp"],
                sellerId: seller.id,
            },
        ],
    });

    console.log("✅ Database seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


