import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between">
            {/* ✅ Correct Usage */}
            <Link href="/" className="text-xl font-bold">Our Arab Heritage</Link>

            <div>
                {user ? (
                    <Link href="/profile" className="mr-4">Profile</Link>
                ) : (
                    <Link href="/login" className="mr-4">Login</Link>
                )}
            </div>
        </nav>
    );
}

