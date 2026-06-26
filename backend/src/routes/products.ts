import fs from "fs";
import path from "path";
import { Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { deleteImageFile, upload } from "../lib/upload";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { productBodySchema } from "../validators/product";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

router.get("/:id", async (req, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

router.post(
  "/",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const parsed = productBodySchema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: "Category not found" });
    }

    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        imagePath: req.file?.filename ?? null,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  }
);

router.put(
  "/:id",
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    const parsed = productBodySchema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ error: "Product not found" });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ error: "Category not found" });
    }

    if (req.file && existing.imagePath) {
      deleteImageFile(existing.imagePath);
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        ...(req.file ? { imagePath: req.file.filename } : {}),
      },
      include: { category: true },
    });

    res.json(product);
  }
);

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }

  deleteImageFile(existing.imagePath);
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
