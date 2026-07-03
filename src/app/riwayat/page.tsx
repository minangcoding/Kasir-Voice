"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Riwayat Transaksi</h1>
          <Link href="/" className="w-full sm:w-auto text-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium">
            Kembali ke Kasir
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Memuat data...</p>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500 text-base sm:text-lg">Belum ada transaksi yang disimpan.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {transactions.map((trx) => (
              <div key={trx.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 sm:pb-4 mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">ID Transaksi: #{trx.id}</p>
                    <p className="font-semibold text-gray-700 text-sm sm:text-base">
                      {new Date(trx.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      Rp {trx.total.toLocaleString("id-ID")}
                    </p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mt-1">
                      {trx.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-600 text-sm mb-2">Item Pembelian:</p>
                  {trx.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.product?.name || "Produk dihapus"} x {item.quantity}</span>
                      <span className="font-medium text-gray-700">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
