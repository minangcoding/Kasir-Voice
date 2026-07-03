import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Initialize the database adapter for Prisma 7
const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, paymentMethod, total } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Buat transaksi baru beserta detail itemnya menggunakan Prisma nested writes
    const transaction = await prisma.transaction.create({
      data: {
        total: total,
        paymentMethod: paymentMethod || "Cash",
        items: {
          create: cart.map((item: any) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}
