import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, totalPrice } = useCart();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((product) => (
              <li key={product.id} className="border-b py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{product.title}</h2>
                    <p className="text-gray-700">${product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* ✅ Display Total Price */}
          <div className="mt-6 text-xl font-bold text-gray-900">
            Total: ${totalPrice.toFixed(2)}
          </div>

          {/* ✅ Checkout Button */}
          <Link href="/checkout">
            <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600">
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}

      {/* Go back to products */}
      <Link href="/">
        <button className="mt-6 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
          Continue Shopping
        </button>
      </Link>
    </div>
  );
}
