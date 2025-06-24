import { PrismaClient } from "../../node_modules/@prisma/clients/codes_prisma";
// Tạo một instance của PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    transactionOptions: {
      maxWait: 60000, // 60 giây
      timeout: 120000, // 120 giây
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
