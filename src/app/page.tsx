"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Tipe data untuk produk dan item di keranjang
type Product = { id: number; name: string; price: number };
type CartItem = Product & { qty: number };

// Data dummy untuk produk
const DUMMY_PRODUCTS: Product[] = [
  { id: 1, name: "Kopi susu", price: 15000 },
  { id: 2, name: "Roti coklat", price: 8000 },
  { id: 3, name: "Es teh", price: 5000 },
  { id: 4, name: "Teh manis", price: 5000 },
  { id: 5, name: "Bakso", price: 15000 },
  { id: 6, name: "Mie ayam", price: 12000 },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Menghitung total belanja
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const recognitionRef = useRef<any>(null);

  const handleVoiceCommand = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Inisialisasi Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung fitur suara (Gunakan Google Chrome).");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false; // Hanya ambil hasil akhir
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript("Mendengarkan...");
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      
      // Proses AI dengan teks hasil rekaman
      processWithAI(speechResult);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsRecording(false);
      setTranscript("Gagal mendengar, silakan coba lagi.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processWithAI = async (text: string) => {
    setTranscript(`"${text}" (Memproses AI...)`);
    
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses AI");
      }

      setTranscript(`Berhasil diproses!`);
      
      if (data.paymentMethod && data.paymentMethod.trim() !== "") {
        setPaymentMethod(data.paymentMethod);
      }

      // Cocokkan item dari AI dengan produk di database (DUMMY_PRODUCTS)
      if (data.items && Array.isArray(data.items)) {
        const newCartItems: CartItem[] = [];
        
        data.items.forEach((aiItem: any) => {
          // Pencarian sederhana (case insensitive)
          const matchedProduct = DUMMY_PRODUCTS.find(p => 
            p.name.toLowerCase().includes(aiItem.name.toLowerCase()) || 
            aiItem.name.toLowerCase().includes(p.name.toLowerCase())
          );

          if (matchedProduct) {
            newCartItems.push({
              ...matchedProduct,
              qty: aiItem.qty || 1
            });
          }
        });

        if (newCartItems.length > 0) {
          // Tambahkan ke keranjang
          setCart(prev => {
            const updatedCart = [...prev];
            newCartItems.forEach(newItem => {
              const existing = updatedCart.find(item => item.id === newItem.id);
              if (existing) {
                existing.qty += newItem.qty;
              } else {
                updatedCart.push(newItem);
              }
            });
            return updatedCart;
          });
        } else {
          setTranscript(`Pesanan "${text}" tidak ditemukan di database produk.`);
        }
      }
    } catch (error: any) {
      console.error(error);
      setTranscript(`Error AI: ${error.message}`);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setTranscript("Menyimpan transaksi...");
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, paymentMethod, total: subtotal }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan");

      setCart([]);
      setTranscript("Transaksi berhasil disimpan ke database!");
      setPaymentMethod("Cash");
    } catch (error) {
      console.error(error);
      setTranscript("Terjadi kesalahan saat menyimpan transaksi.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      
      {/* Kiri: Daftar Produk & Voice Command */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">AI Kasir Voice</h1>
            <p className="text-sm text-gray-500 mt-1">Ucapkan pesanan Anda</p>
          </div>
          <Link 
            href="/riwayat" 
            className="w-full sm:w-auto px-4 py-2 text-center bg-white text-blue-600 font-medium rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Lihat Riwayat Transaksi
          </Link>
        </div>

        {/* Bagian Voice Command */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
          <button 
            onClick={handleVoiceCommand}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}`}
          >
            🎤
          </button>
          <p className="mt-4 text-gray-600 font-medium text-center">
            {isRecording ? "Sedang Merekam..." : "Ketuk untuk Bicara"}
          </p>
          {transcript && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full text-center border border-gray-100">
              <p className="text-gray-700 italic break-words">"{transcript}"</p>
            </div>
          )}
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-6 lg:pb-0">
          {DUMMY_PRODUCTS.map(product => (
            <div key={product.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{product.name}</h3>
              <p className="text-blue-600 font-semibold mt-1 text-sm sm:text-base">Rp {product.price.toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kanan: Keranjang (Cart) */}
      <div className="w-full lg:w-[400px] h-[50vh] lg:h-auto bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-6 flex flex-col shadow-xl z-10 shrink-0">
        <h2 className="text-xl font-bold mb-4 border-b pb-4">Pesanan Saat Ini</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 lg:mb-0">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Belum ada pesanan
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{item.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')} x {item.qty}</p>
                  </div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-4">
          <div className="flex justify-between text-gray-600 text-sm sm:text-base">
            <span>Metode Bayar</span>
            <span className="font-semibold">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
          >
            Simpan Transaksi
          </button>
        </div>
      </div>

    </div>
  );
}
