import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [loading, user]);

    if (loading || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 text-lg">Checking authentication...</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

