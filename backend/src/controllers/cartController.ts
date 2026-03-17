import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export async function getCart(req: Request, res: Response) {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, service: true } },
          addons: { where: { isActive: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price.toString()) * item.quantity,
    0,
  );

  return sendSuccess(res, { items, subtotal: subtotal.toFixed(2) });
}

export async function addToCart(req: Request, res: Response) {
  const { productId, quantity = 1, notes } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isAvailable) throw new AppError('Product not available', 400);

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });

  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { userId_productId: { userId: req.user!.userId, productId } },
      data: { quantity: existing.quantity + quantity, notes },
      include: { product: true },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId: req.user!.userId, productId, quantity, notes },
      include: { product: true },
    });
  }

  return sendSuccess(res, item, 'Added to cart', 201);
}

export async function updateCartItem(req: Request, res: Response) {
  const { quantity, notes } = req.body;
  const { itemId } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: req.user!.userId },
  });
  if (!item) throw new AppError('Cart item not found', 404);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return sendSuccess(res, null, 'Item removed from cart');
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity, notes },
    include: { product: true },
  });
  return sendSuccess(res, updated, 'Cart updated');
}

export async function removeFromCart(req: Request, res: Response) {
  const { itemId } = req.params;
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: req.user!.userId },
  });
  if (!item) throw new AppError('Cart item not found', 404);

  await prisma.cartItem.delete({ where: { id: itemId } });
  return sendSuccess(res, null, 'Item removed from cart');
}

export async function clearCart(req: Request, res: Response) {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  return sendSuccess(res, null, 'Cart cleared');
}
