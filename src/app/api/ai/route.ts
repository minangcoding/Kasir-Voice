import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ambil API Key dari environment variable
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY belum diatur di file .env" 
      }, { status: 500 });
    }

    // Gunakan model Gemini terbaru yang tersedia
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Anda adalah sistem kasir AI pintar.
Ekstrak pesanan dan jumlahnya, serta metode pembayaran dari kalimat berikut.
Hanya kembalikan output dalam format JSON murni, tanpa backticks atau teks tambahan apa pun.

Format JSON yang Diharapkan:
{
  "items": [
    { "name": "string (nama produk)", "qty": number (jumlah) }
  ],
  "paymentMethod": "string (misalnya: Cash, QRIS, Debit, atau kosongkan jika tidak ada)"
}

Kalimat Kasir: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // Hapus backticks (```json ... ```) jika ada, karena AI kadang menambahkannya
    const cleanJsonString = aiText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    const parsedData = JSON.parse(cleanJsonString);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
