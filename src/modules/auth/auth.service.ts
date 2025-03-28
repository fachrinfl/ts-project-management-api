import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../shared/utils/jwt';

const prisma = new PrismaClient();

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
};

interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const expiresAt = dayjs().add(7, 'day').toDate();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

interface UpdatePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
}: UpdatePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
};
