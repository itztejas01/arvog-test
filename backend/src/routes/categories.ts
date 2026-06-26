import { Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { categorySchema } from "../validators/category";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

router.get("/:id", async (req, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
  });
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  res.json(category);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const category = await prisma.category.create({ data: parsed.data });
  res.status(201).json(category);
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});

export default router;
