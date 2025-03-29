import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const searchUsersByEmail = async (
  keyword: string,
  excludeUserId: string,
) => {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: keyword,
        mode: 'insensitive',
      },
      NOT: {
        id: excludeUserId,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 10,
  });

  return users;
};
