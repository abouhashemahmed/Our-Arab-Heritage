const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require('@faker-js/faker'); // Added for better mock data
const prisma = new PrismaClient();

// ✅ Constants (consider moving to separate config file)
const ARAB_COUNTRIES = [
  "Palestine", "Morocco", "Egypt", "Jordan", "Lebanon", 
  "Syria", "Algeria", "Iraq", "Tunisia", "Yemen"
];

const CATEGORIES = [
  "Ceramics", "Woodwork", "Textiles", "Accessories", 
  "Jewelry", "Calligraphy", "Kitchenware", 
  "Home Decor", "Spices", "Books"
];

// 🛠️ Configuration
const NUM_USERS = 5;
const NUM_PRODUCTS = 20;
const NUM_REVIEWS = 30;
const SALT_ROUNDS = 12;

async function main() {
  console.log("🌱 Starting database seeding...");

  // 🧹 Cleanup existing data
  const deleteOrder = [
    prisma.review.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany()
  ];
  
  await prisma.$transaction(deleteOrder);
  console.log("✅ Cleared existing data");

  // 👥 Create users
  const users = await Promise.all(
    Array.from({ length: NUM_USERS }, (_, i) => {
      const role = i === 0 ? 'ADMIN' : 
                  i === 1 ? 'SELLER' : 
                  Math.random() > 0.8 ? 'SELLER' : 'BUYER';
      
      return prisma.user.create({
        data: {
          email: `${role.toLowerCase()}${i}@ourarabheritage.com`,
          password: bcrypt.hashSync(`SecurePass${i}!`, SALT_ROUNDS),
          role: role,
          membership: role === 'SELLER' || Math.random() > 0.5,
          proSeller: role === 'SELLER' && Math.random() > 0.5,
          createdAt: faker.date.between({ 
            from: '2023-01-01', 
            to: new Date() 
          })
        }
      });
    })
  );
  console.log(`✅ Created ${users.length} users`);

  // 🛍️ Create products
  const sellerIds = users
    .filter(u => u.role === 'SELLER')
    .map(u => u.id);

  const products = await prisma.$transaction(
    Array.from({ length: NUM_PRODUCTS }, (_, i) => {
      return prisma.product.create({
        data: {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
          images: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
            faker.image.urlLoremFlickr({ category: 'crafts' })
          ),
          country: faker.helpers.arrayElement(ARAB_COUNTRIES),
          categories: faker.helpers.arrayElements(CATEGORIES, { min: 1, max: 3 }),
          stock: faker.number.int({ min: 0, max: 100 }),
          sellerId: faker.helpers.arrayElement(sellerIds),
          createdAt: faker.date.between({
            from: '2023-01-01',
            to: new Date()
          })
        }
      });
    })
  );
  console.log(`📦 Created ${products.length} products`);

  // ⭐ Create reviews
  const buyers = users.filter(u => u.role === 'BUYER');
  await prisma.review.createMany({
    data: Array.from({ length: NUM_REVIEWS }, () => ({
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentences({ min: 1, max: 3 }),
      userId: faker.helpers.arrayElement(buyers).id,
      productId: faker.helpers.arrayElement(products).id,
      createdAt: faker.date.between({
        from: '2023-01-01',
        to: new Date()
      })
    }))
  });
  console.log(`⭐ Created ${NUM_REVIEWS} reviews`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma connection closed");
  });

