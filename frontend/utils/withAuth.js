import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.replace("/login"); // Redirect to login if not authenticated
      }
    }, [user]);

    if (!user) return null; // Prevent rendering until redirected

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;


