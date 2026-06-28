import fs from "fs";
import multer from "multer";
import path from "path";
import { Response, Router } from "express";
import { bulkUploadDir } from "../lib/storage";
import { authMiddleware } from "../middleware/auth";
import {
  importProductsFromCsv,
  importProductsFromXlsx,
} from "../services/bulkImport";

const upload = multer({
  dest: bulkUploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".csv", ".xlsx"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and XLSX files are allowed"));
    }
  },
});

const router = Router();

router.post(
  "/bulk-upload",
  authMiddleware,
  (req, res, next) => {
    req.setTimeout(10 * 60 * 1000);
    res.setTimeout(10 * 60 * 1000);
    next();
  },
  upload.single("file"),
  async (req, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      const result =
        ext === ".csv"
          ? await importProductsFromCsv(req.file.path)
          : await importProductsFromXlsx(req.file.path);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Bulk import failed",
      });
    } finally {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  },
);

export default router;
