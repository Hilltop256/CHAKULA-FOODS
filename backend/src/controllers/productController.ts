import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { slugify, paginate } from '../utils/response';

// ===== CATEGORIES =====

export async function getCategories(req: Request, res: Response) {
  const { service } = req.query;
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      ...(service && { service: service as any }),
    },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  return sendSuccess(res, categories);
}

export async function getCategoryBySlug(req: Request, res: Response) {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError('Category not found', 404);
  return sendSuccess(res, category);
}

export async function createCategory(req: Request, res: Response) {
  const { name, description, imageUrl, service, sortOrder } = req.body;
  const slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError('Category with this name already exists', 409);

  const category = await prisma.category.create({
    data: { name, slug, description, imageUrl, service, sortOrder: sortOrder || 0 },
  });
  return sendSuccess(res, category, 'Category created', 201);
}

export async function updateCategory(req: Request, res: Response) {
  const { name, description, imageUrl, service, isActive, sortOrder } = req.body;
  const data: any = { description, imageUrl, service, isActive, sortOrder };
  if (name) {
    data.name = name;
    data.slug = slugify(name);
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data,
  });
  return sendSuccess(res, category, 'Category updated');
}

export async function deleteCategory(req: Request, res: Response) {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (count > 0) throw new AppError('Cannot delete category with products', 400);

  await prisma.category.delete({ where: { id: req.params.id } });
  return sendSuccess(res, null, 'Category deleted');
}

// ===== PRODUCTS =====

export async function getProducts(req: Request, res: Response) {
  const {
    page = '1',
    limit = '20',
    category,
    service,
    featured,
    search,
    minPrice,
    maxPrice,
    available,
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const { skip, take } = paginate(pageNum, limitNum);

  const where: any = {};
  if (available !== 'false') where.isAvailable = true;
  if (category) where.categoryId = category;
  if (featured === 'true') where.isFeatured = true;
  if (service) where.category = { service };
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { tags: { has: search as string } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice && { gte: parseFloat(minPrice as string) }),
      ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, service: true } },
        addons: { where: { isActive: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return sendSuccess(res, products, 'Products fetched', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function getProductBySlug(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      addons: { where: { isActive: true } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });
  if (!product) throw new AppError('Product not found', 404);
  return sendSuccess(res, product);
}

export async function createProduct(req: Request, res: Response) {
  const {
    name,
    description,
    price,
    compareAtPrice,
    imageUrl,
    images,
    categoryId,
    isAvailable,
    isFeatured,
    preparationTime,
    calories,
    allergens,
    tags,
    sortOrder,
    addons,
  } = req.body;

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new AppError('Product with this name already exists', 409);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      imageUrl,
      images: images || [],
      categoryId,
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
      preparationTime,
      calories,
      allergens: allergens || [],
      tags: tags || [],
      sortOrder: sortOrder || 0,
      ...(addons && {
        addons: {
          create: addons.map((a: any) => ({ name: a.name, price: a.price })),
        },
      }),
    },
    include: { category: true, addons: true },
  });
  return sendSuccess(res, product, 'Product created', 201);
}

export async function updateProduct(req: Request, res: Response) {
  const { name, ...rest } = req.body;
  const data: any = { ...rest };
  if (name) {
    data.name = name;
    data.slug = slugify(name);
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data,
    include: { category: true, addons: true },
  });
  return sendSuccess(res, product, 'Product updated');
}

export async function deleteProduct(req: Request, res: Response) {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isAvailable: false },
  });
  return sendSuccess(res, null, 'Product deactivated');
}

export async function getFeaturedProducts(req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: {
      category: { select: { id: true, name: true, service: true } },
      addons: { where: { isActive: true } },
    },
    orderBy: { sortOrder: 'asc' },
    take: 12,
  });
  return sendSuccess(res, products);
}

// ===== REVIEWS =====

export async function addReview(req: Request, res: Response) {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: req.user!.userId, productId } },
    create: { userId: req.user!.userId, productId, rating, comment },
    update: { rating, comment },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  return sendSuccess(res, review, 'Review submitted', 201);
}

export async function getProductReviews(req: Request, res: Response) {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { productId, isVisible: true },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return sendSuccess(res, { reviews, averageRating: avg, totalReviews: reviews.length });
}
