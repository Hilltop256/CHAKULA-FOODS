import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { addDays } from 'date-fns';

function addDaysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function register(req: Request, res: Response) {
  const { email, password, name, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, phone },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: addDaysFromNow(7),
    },
  });

  return sendSuccess(res, { user, accessToken, refreshToken }, 'Account created successfully', 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: addDaysFromNow(7),
    },
  });

  return sendSuccess(
    res,
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    },
    'Login successful',
  );
}

export async function refreshTokens(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new AppError('User not found or inactive', 401);

  const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: addDaysFromNow(7),
    },
  });

  return sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return sendSuccess(res, null, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatarUrl: true,
      address: true,
      city: true,
      isVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return sendSuccess(res, user);
}

export async function updateProfile(req: Request, res: Response) {
  const { name, phone, address, city } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, phone, address, city },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatarUrl: true,
      address: true,
      city: true,
    },
  });
  return sendSuccess(res, user, 'Profile updated');
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError('User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return sendSuccess(res, null, 'Password changed successfully');
}
