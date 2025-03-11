import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router"; // ✅ Import Next.js router

export default function SuccessPage() {
  const { setCart } = useCart();
  const router = useRouter(); // ✅ Use Next.js Router

  useEffect(() => {
    setCart([]); // ✅ Clear cart after successful payment
    localStorage.removeItem("cart"); // ✅ Clear local storage
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful! 🎉</h1>
      <p className="text-lg text-gray-700 mt-4">
        Thank you for your purchase! Your order is being processed.
      </p>

      {/* ✅ Continue Shopping Button */}
      <button
        onClick={() => router.push("/products")} // ✅ Navigate to products page
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Continue Shopping
      </button>
    </div>
  );
}



