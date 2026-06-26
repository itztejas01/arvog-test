import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { streamProductsCsv, streamProductsXlsx } from "../services/reportExport";

const router = Router();

router.get("/products", authMiddleware, async (req, res: Response) => {
  req.setTimeout(10 * 60 * 1000);
  res.setTimeout(10 * 60 * 1000);

  const formatType = req.query.format === "xlsx" ? "xlsx" : "csv";
  const categoryId =
    typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  try {
    if (formatType === "xlsx") {
      await streamProductsXlsx(res, categoryId, search);
    } else {
      await streamProductsCsv(res, categoryId, search);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Report export failed",
      });
    }
  }
});

export default router;
