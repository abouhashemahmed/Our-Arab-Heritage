const { PrismaClient } = require("@prisma/client");
const cliProgress = require("cli-progress");
const yargs = require("yargs");

const prisma = new PrismaClient();

// ✅ Configuration
const ARAB_COUNTRIES = [
    "Algeria", "Bahrain", "Comoros", "Djibouti", "Egypt",
    "Iraq", "Jordan", "Kuwait", "Lebanon", "Libya",
    "Mauritania", "Morocco", "Oman", "Palestine",
    "Qatar", "Saudi Arabia", "Somalia", "Sudan",
    "Syria", "Tunisia", "United Arab Emirates", "Yemen"
];

const BATCH_SIZE = 500; // Adjust based on your DB capacity
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// ✅ Command-line setup
const argv = yargs(process.argv.slice(2))
    .option("dry-run", {
        alias: "d",
        type: "boolean",
        default: false,
        description: "Run without making changes"
    })
    .argv;

// ✅ Validation
function validateCountries() {
    if (ARAB_COUNTRIES.length === 0) {
        throw new Error("Country list is empty");
    }
    const uniqueCountries = new Set(ARAB_COUNTRIES);
    if (uniqueCountries.size !== ARAB_COUNTRIES.length) {
        throw new Error("Duplicate countries detected");
    }
}

// ✅ Batch processor
async function processBatch(batch, attempt = 1) {
    try {
        return await prisma.$transaction(
            batch.map(data => prisma.product.update(data))
        );
    } catch (error) {
        if (attempt <= MAX_RETRIES) {
            console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return processBatch(batch, attempt + 1);
        }
        throw error;
    }
}

async function updateProducts() {
    try {
        console.log("🔄 Starting database update process...");
        validateCountries();

        // ✅ Find products needing updates
        const products = await prisma.product.findMany({
            where: { 
                OR: [{ country: null }, { country: "" }]
            },
            select: { id: true, title: true }
        });

        if (products.length === 0) {
            console.log("✅ All products have valid country entries");
            return { updated: 0 };
        }

        // ✅ Prepare updates
        const updateData = products.map(product => ({
            where: { id: product.id },
            data: { 
                country: ARAB_COUNTRIES[
                    Math.floor(Math.random() * ARAB_COUNTRIES.length)
                ]
            }
        }));

        // ✅ Dry-run mode
        if (argv.dryRun) {
            console.log("🚧 Dry Run Mode (no changes will be made)");
            console.table(updateData.slice(0, 5).map(d => ({
                id: d.where.id,
                newCountry: d.data.country
            })));
            console.log(`📋 Would update ${updateData.length} products`);
            return { updated: 0 };
        }

        // ✅ Batch processing
        const progressBar = new cliProgress.SingleBar({
            format: "🚀 Progress: [{bar}] {percentage}% | {value}/{total} products",
            hideCursor: true
        }, cliProgress.Presets.shades_classic);

        progressBar.start(updateData.length, 0);
        
        let processed = 0;
        const countryDistribution = {};

        while (processed < updateData.length) {
            const batch = updateData.slice(processed, processed + BATCH_SIZE);
            const result = await processBatch(batch);
            
            result.forEach(updated => {
                countryDistribution[updated.country] = 
                    (countryDistribution[updated.country] || 0) + 1;
            });

            processed += batch.length;
            progressBar.update(processed);
            
            console.log(`🔄 Processed ${processed}/${updateData.length} records`);
        }

        progressBar.stop();

        // ✅ Reporting
        console.log(`🎉 Successfully updated ${processed} products`);
        console.log("📊 Country Distribution:");
        console.table(countryDistribution);

        return { updated: processed };

    } catch (error) {
        console.error("❌ Database update failed:", error);
        process.exitCode = 1;
        return { updated: 0, error };
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Database connection closed");
    }
}

// ✅ Execute with timing
(async () => {
    const startTime = Date.now();
    const result = await updateProducts();
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`⏱️  Process completed in ${duration.toFixed(2)} seconds`);
    process.exit(result.error ? 1 : 0);
})();
