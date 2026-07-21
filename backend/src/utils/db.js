const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function connectDB() {
  await prisma.$connect();
  console.log('Database connected');
}

async function disconnectDB() {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

module.exports = { prisma, connectDB, disconnectDB };
