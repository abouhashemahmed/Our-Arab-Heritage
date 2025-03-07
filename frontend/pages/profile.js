import { useAuth } from "@/context/AuthContext";
import withAuth from "@/utils/withAuth";
import Link from "next/link";

function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="text-center mt-10">
                <h1 className="text-2xl font-bold">You are not logged in</h1>
                <Link href="/login">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="mt-4 text-gray-600">Email: {user.email || "No email found"}</p>

            <button
                onClick={logout}
                className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
                Logout
            </button>
        </div>
    );
}

export default withAuth(Profile);
