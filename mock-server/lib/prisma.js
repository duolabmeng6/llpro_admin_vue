import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// 创建Prisma客户端实例
const prisma = new PrismaClient();

export default prisma; 