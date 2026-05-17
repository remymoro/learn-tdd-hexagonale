import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client";

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL est manquant dans le fichier .env");
    }
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}

let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (!_prisma) _prisma = createPrismaClient();
        return (_prisma as unknown as Record<string | symbol, unknown>)[prop];
    },
});