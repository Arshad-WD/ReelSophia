const { PrismaClient } = require('@prisma/client');
const { processReelInline } = require('./src/lib/inline-processor');
// Note: We might need to mock some next.js things or use ts-node for aliases
// But let's try a simpler approach if possible.

const prisma = new PrismaClient();

async function test() {
  console.log("Starting full pipeline test...");
  
  // 1. Ensure a user exists
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log("Creating test user...");
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        passwordHash: "mock",
        aiSettings: {
          keys: {
             openrouter: process.env.OPENROUTER_API_KEY
          }
        }
      }
    });
  }
  
  const userId = user.id;
  const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const platform = "youtube";
  
  // 2. Create Reel
  console.log("Creating reel record...");
  const reel = await prisma.reel.create({
    data: {
      userId,
      sourceUrl: url,
      platform,
      status: "PENDING"
    }
  });
  
  // 3. Create Job
  await prisma.processingJob.create({
    data: {
      reelId: reel.id,
      status: "PENDING",
      progress: 0
    }
  });
  
  console.log(`Reel ${reel.id} created. Starting inline processing...`);
  
  // 4. Import and run (we need to handle the alias manually or use require)
  // This is tricky because inline-processor uses ES modules and aliases.
  // I will just use a simpler script that I can run with ts-node if I have it.
}

test();
