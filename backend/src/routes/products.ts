import { Response, Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { paramId } from "../lib/params";
import { enrichProduct, enrichProducts } from "../lib/productPresenter";
import { persistProductImage, removeProductImage } from "../lib/storage";
import { upload } from "../lib/upload";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { productBodySchema } from "../validators/product";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(await enrichProducts(products));
});

router.get("/list", async (req, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { price: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: await enrichProducts(data),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  });
});

router.get("/:id", async (req, res: Response) => {
  const id = paramId(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(await enrichProduct(product));
});

router.post("/", upload.single("image"), async (req: AuthRequest, res: Response) => {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return res.status(400).json({ error: "Category not found" });
  }

  let imagePath: string | null = null;
  if (req.file) {
    imagePath = await persistProductImage(req.file);
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      imagePath,
    },
    include: { category: true },
  });

  res.status(201).json(await enrichProduct(product));
});

router.put("/:id", upload.single("image"), async (req: AuthRequest, res: Response) => {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const id = paramId(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return res.status(400).json({ error: "Category not found" });
  }

  let imagePath = existing.imagePath;
  if (req.file) {
    if (existing.imagePath) {
      await removeProductImage(existing.imagePath);
    }
    imagePath = await persistProductImage(req.file);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      imagePath,
    },
    include: { category: true },
  });

  res.json(await enrichProduct(product));
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = paramId(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }

  await removeProductImage(existing.imagePath);
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
});

export default router;
