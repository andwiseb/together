import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to Database.');
    } catch (error) {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    }
}