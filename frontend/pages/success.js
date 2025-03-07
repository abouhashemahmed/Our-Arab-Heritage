import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

export default function SuccessPage() {
  const { cart, setCart } = useCart();

  useEffect(() => {
    setCart([]); // Clear cart after successful payment
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-green-700">Payment Successful! 🎉</h1>
      <p className="text-lg mt-2">Thank you for your purchase. Your order has been processed.</p>

      <Link href="/">
        <button className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
          Back to Home
        </button>
      </Link>
    </div>
  );
}

