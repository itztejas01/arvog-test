import { Prisma } from "@prisma/client";
import ExcelJS from "exceljs";
import { format } from "fast-csv";
import { Response } from "express";
import { prisma } from "../lib/prisma";

const BATCH_SIZE = 500;

function buildWhere(
  categoryId?: string,
  search?: string,
): Prisma.ProductWhereInput {
  const filters: Prisma.ProductWhereInput[] = [];

  if (categoryId) {
    filters.push({ categoryId });
  }

  if (search?.trim()) {
    filters.push({
      OR: [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { category: { name: { contains: search.trim(), mode: "insensitive" } } },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : {};
}

async function* productBatches(where: Prisma.ProductWhereInput) {
  let skip = 0;
  while (true) {
    const batch = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip,
      take: BATCH_SIZE,
    });
    if (batch.length === 0) break;
    yield batch;
    skip += batch.length;
  }
}

export async function streamProductsCsv(
  res: Response,
  categoryId?: string,
  search?: string,
) {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="products-report.csv"',
  );

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  const where = buildWhere(categoryId, search);
  for await (const batch of productBatches(where)) {
    for (const product of batch) {
      csvStream.write({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        category: product.category.name,
        imagePath: product.imagePath ?? "",
        createdAt: product.createdAt.toISOString(),
      });
    }
  }

  csvStream.end();
}

export async function streamProductsXlsx(
  res: Response,
  categoryId?: string,
  search?: string,
) {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="products-report.xlsx"',
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const sheet = workbook.addWorksheet("Products");
  sheet.addRow(["ID", "Name", "Price", "Category", "Image Path", "Created At"]).commit();

  const where = buildWhere(categoryId, search);
  for await (const batch of productBatches(where)) {
    for (const product of batch) {
      sheet
        .addRow([
          product.id,
          product.name,
          Number(product.price),
          product.category.name,
          product.imagePath ?? "",
          product.createdAt.toISOString(),
        ])
        .commit();
    }
  }

  await workbook.commit();
}
