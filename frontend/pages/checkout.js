import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const { cart, cartTotal = 0 } = useCart(); // Default to 0 if undefined
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("🛒 Debug: Cart before checkout →", cart);

  const handleCheckout = async () => {
    if (!user) {
      setError("⚠️ You must be logged in to checkout.");
      return;
    }

    if (!cart || cart.length === 0) {
      setError("⚠️ Your cart is empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      const data = await response.json();
      console.log("🛠 Debug: Stripe API Response →", data);

      if (data.url) {
        window.location.href = data.url; // ✅ Redirect to Stripe Checkout
      } else {
        throw new Error("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("❌ Checkout Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ If the user is not logged in, show login option
  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-600">⚠️ Access Denied</h1>
        <p className="text-gray-700">You must be logged in to proceed to checkout.</p>
        <Link href="/login">
          <button className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
            Go to Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="text-gray-700">You're almost there!</p>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between py-2">
            <span>{item.title}</span>
            <span>${item.price.toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <p className="text-lg font-bold">Total: ${cartTotal ? cartTotal.toFixed(2) : "0.00"}</p>
      </div>

      <button
        onClick={handleCheckout}
        className={`mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with Stripe"}
      </button>
    </div>
  );
}





