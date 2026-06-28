import fs from "fs";
import { parse } from "csv-parse";
import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma";
import {
  normalizeProductPrice,
  productPriceErrorMessage,
} from "../lib/productPrice";

const BATCH_SIZE = 500;

export interface BulkRow {
  name: string;
  price: number;
  categoryName: string;
}

export interface BulkImportError {
  row: number;
  message: string;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  errors: BulkImportError[];
}

async function resolveCategoryMap(names: string[]) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const categories = await prisma.category.findMany({
    where: { name: { in: unique, mode: "insensitive" } },
  });
  const map = new Map<string, string>();
  for (const cat of categories) {
    map.set(cat.name.toLowerCase(), cat.id);
  }
  return map;
}

async function insertBatch(
  rows: { name: string; price: number; categoryId: string }[],
) {
  if (rows.length === 0) return;
  await prisma.product.createMany({ data: rows });
}

function validateRows(
  rows: BulkRow[],
  startRow: number,
  categoryMap: Map<string, string>,
  result: BulkImportResult,
) {
  const valid: { name: string; price: number; categoryId: string }[] = [];

  rows.forEach((row, index) => {
    const currentRow = startRow + index;
    if (!row.name?.trim()) {
      result.failed++;
      result.errors.push({ row: currentRow, message: "Name is required" });
      return;
    }

    const price = normalizeProductPrice(row.price);
    if (price === null) {
      result.failed++;
      result.errors.push({
        row: currentRow,
        message: productPriceErrorMessage(),
      });
      return;
    }

    const categoryId = categoryMap.get(row.categoryName.trim().toLowerCase());
    if (!categoryId) {
      result.failed++;
      result.errors.push({
        row: currentRow,
        message: `Category not found: ${row.categoryName}`,
      });
      return;
    }

    valid.push({ name: row.name.trim(), price, categoryId });
  });

  return valid;
}

async function flushBatch(
  rows: BulkRow[],
  startRow: number,
  result: BulkImportResult,
) {
  const categoryMap = await resolveCategoryMap(rows.map((r) => r.categoryName));
  const valid = validateRows(rows, startRow, categoryMap, result);

  if (!valid || valid.length === 0) return;

  try {
    await insertBatch(valid);
    result.imported += valid.length;
  } catch (error) {
    result.failed += valid.length;
    result.errors.push({
      row: startRow,
      message:
        error instanceof Error
          ? `Batch insert failed: ${error.message}`
          : "Batch insert failed",
    });
  }
}

export async function importProductsFromCsv(
  filePath: string,
): Promise<BulkImportResult> {
  const result: BulkImportResult = { imported: 0, failed: 0, errors: [] };
  const pending: BulkRow[] = [];
  let rowNumber = 0;

  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }),
  );

  let batchStartRow = 1;
  for await (const record of parser) {
    rowNumber++;
    pending.push({
      name: record.name ?? record.Name ?? "",
      price: Number(record.price ?? record.Price),
      categoryName:
        record.categoryName ?? record.category ?? record.Category ?? "",
    });

    if (pending.length >= BATCH_SIZE) {
      await flushBatch(pending, batchStartRow, result);
      pending.length = 0;
      batchStartRow = rowNumber + 1;
    }
  }

  if (pending.length > 0) {
    await flushBatch(pending, batchStartRow, result);
  }

  return result;
}

export async function importProductsFromXlsx(
  filePath: string,
): Promise<BulkImportResult> {
  const result: BulkImportResult = { imported: 0, failed: 0, errors: [] };
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return result;
  }

  const headerRow = sheet.getRow(1);
  const headers: Record<string, number> = {};
  headerRow.eachCell((cell, col) => {
    const key = String(cell.value ?? "")
      .trim()
      .toLowerCase();
    if (key) headers[key] = col;
  });

  const nameCol = headers.name;
  const priceCol = headers.price;
  const categoryCol = headers.categoryname ?? headers.category;

  if (!nameCol || !priceCol || !categoryCol) {
    result.failed++;
    result.errors.push({
      row: 1,
      message: "Header must include name, price, and categoryName columns",
    });
    return result;
  }

  const pending: BulkRow[] = [];
  let batchStartRow = 2;

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);
    const name = String(row.getCell(nameCol).value ?? "").trim();
    const price = Number(row.getCell(priceCol).value);
    const categoryName = String(row.getCell(categoryCol).value ?? "").trim();

    if (!name && !categoryName && !price) continue;

    pending.push({ name, price, categoryName });

    if (pending.length >= BATCH_SIZE) {
      await flushBatch(pending, batchStartRow, result);
      pending.length = 0;
      batchStartRow = rowNum + 1;
    }
  }

  if (pending.length > 0) {
    await flushBatch(pending, batchStartRow, result);
  }

  return result;
}
