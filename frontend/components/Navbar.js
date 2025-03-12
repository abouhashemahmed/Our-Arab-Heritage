import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Left: Cart Button */}
      <Link href="/cart">
        <button className="bg-blue-500 px-4 py-2 rounded-lg">
          🛒 Cart ({cart.length})
        </button>
      </Link>

      {/* Right: User Login */}
      {user ? (
        <div>
          <span>Welcome, {user.email}</span>
          <button className="ml-4 bg-red-500 px-3 py-1 rounded-lg" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <Link href="/login">
          <button className="bg-green-500 px-4 py-2 rounded-lg">
            Login / Sign Up
          </button>
        </Link>
      )}
    </nav>
  );
}


