import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart(); // Get cart items

  return (
    <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
      <Link href="/" className="text-lg font-bold">Our Arab Heritage</Link>
      
      {/* Cart Button */}
      <Link href="/cart">
        <button className="relative px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          🛒 Cart
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
              {cart.length}
            </span>
          )}
        </button>
      </Link>
    </nav>
  );
}

