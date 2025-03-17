const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateProducts() {
    try {
        console.log("🔄 Updating products with missing country fields...");

        const products = await prisma.product.findMany({
            where: { country: null }, // ✅ Find products with missing country
        });

        if (products.length === 0) {
            console.log("✅ All products already have a country assigned!");
            return;
        }

        const countryOptions = [
            "Palestine", "Morocco", "Egypt", "Lebanon", "Syria", "Jordan", "Iraq", "Tunisia",
            "Algeria", "Sudan", "Libya", "Mauritania", "Saudi Arabia", "UAE", "Kuwait", "Oman",
            "Qatar", "Bahrain", "Yemen", "Somalia", "Djibouti", "Comoros"
        ];

        for (const product of products) {
            const randomCountry = countryOptions[Math.floor(Math.random() * countryOptions.length)]; // Assign random country
            await prisma.product.update({
                where: { id: product.id },
                data: { country: randomCountry },
            });
            console.log(`✅ Updated product "${product.title}" with country: ${randomCountry}`);
        }

        console.log("🎉 Database update complete!");
    } catch (error) {
        console.error("❌ Error updating database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the update function
updateProducts();

