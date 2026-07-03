const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
  const prisma = new PrismaClient({ 
    datasourceUrl: process.env.DATABASE_URL
  });

  try {
    const products = await prisma.product.findMany();
    console.log("Products found:", products.length);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
