import { Response, Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import {
  streamProductsCsv,
  streamProductsXlsx,
} from "../services/reportExport";
import { reportQuerySchema } from "../validators/report";

const router = Router();

router.get(
  "/products",
  authMiddleware,
  asyncHandler(async (req, res: Response) => {
    req.setTimeout(10 * 60 * 1000);
    res.setTimeout(10 * 60 * 1000);

    const parsed = reportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { format, categoryId, search } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }
    }

    if (format === "xlsx") {
      await streamProductsXlsx(res, categoryId, search);
    } else {
      await streamProductsCsv(res, categoryId, search);
    }
  }),
);

export default router;
