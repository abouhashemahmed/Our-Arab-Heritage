import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Left: Cart Button */}
      <div className="flex items-center gap-4">
        <Link href="/cart">
          <button className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
            🛒 Cart ({cart.length})
          </button>
        </Link>

        {/* ✅ Sell Product Link - Always Visible */}
        <Link href="/sell">
          <button className="bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600">
            📦 Sell a Product
          </button>
        </Link>
      </div>

      {/* Right: User Login / Logout */}
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.email}</span>
            <button className="bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600">
              Login / Sign Up
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}



