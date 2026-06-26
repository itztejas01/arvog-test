"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = "admin@example.com";
    const password = "admin123";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: {
                email,
                password: await bcrypt_1.default.hash(password, 10),
            },
        });
        console.log(`Created user: ${email} / ${password}`);
    }
    const categories = ["Electronics", "Clothing", "Books"];
    const categoryMap = new Map();
    for (const name of categories) {
        const found = await prisma.category.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
        });
        if (found) {
            categoryMap.set(name, found.id);
        }
        else {
            const created = await prisma.category.create({ data: { name } });
            categoryMap.set(name, created.id);
        }
    }
    const products = [
        { name: "Wireless Mouse", price: 29.99, category: "Electronics" },
        { name: "USB Keyboard", price: 49.99, category: "Electronics" },
        { name: "T-Shirt", price: 19.99, category: "Clothing" },
        { name: "Jeans", price: 59.99, category: "Clothing" },
        { name: "TypeScript Handbook", price: 39.99, category: "Books" },
    ];
    for (const item of products) {
        const categoryId = categoryMap.get(item.category);
        if (!categoryId)
            continue;
        const exists = await prisma.product.findFirst({
            where: { name: item.name, categoryId },
        });
        if (!exists) {
            await prisma.product.create({
                data: {
                    name: item.name,
                    price: item.price,
                    categoryId,
                },
            });
        }
    }
    console.log("Seed completed.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
