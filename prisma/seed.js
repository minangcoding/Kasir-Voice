const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const products = [
    { name: 'Kopi susu', price: 15000 },
    { name: 'Roti coklat', price: 8000 },
    { name: 'Es teh', price: 5000 },
    { name: 'Teh manis', price: 5000 },
    { name: 'Bakso', price: 15000 },
    { name: 'Mie ayam', price: 12000 },
  ]

  console.log('Start seeding...')
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    })
    console.log(`Created product with id: ${product.id}`)
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
