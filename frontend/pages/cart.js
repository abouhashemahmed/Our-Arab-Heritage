import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item, index) => (
            <div key={index} className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-gray-700">${item.price}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}

          {/* ✅ Checkout Button */}
          <Link href="/checkout">
            <button className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}

      {/* ✅ Go back to products */}
      <Link href="/">
        <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}
