const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reels = await prisma.reel.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      job: true
    }
  });
  console.log(JSON.stringify(reels, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
