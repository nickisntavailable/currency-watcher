import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", theme: "system", mainCurrency: "USD" },
  });

  await prisma.favoriteSet.createMany({
    data: [
      { name: "Путешествия", icon: "plane", currencyCodes: ["USD", "EUR", "THB"], sortOrder: 0 },
      { name: "Платежи", icon: "home-2", currencyCodes: ["RUB", "AED"], sortOrder: 1 },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });