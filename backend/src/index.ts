import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import productRoutes from "./routes/products";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
