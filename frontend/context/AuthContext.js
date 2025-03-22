import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode"; // Required for expiration checks

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔒 Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = typeof window !== "undefined" && localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // 🛡️ JWT expiration check (optional)
        if (!checkTokenExpiration(storedToken)) {
          throw new Error("Token expired");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          if (userData?.id) {
            setUser(userData);
            setToken(storedToken);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth init error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ⏰ Token validation interval
  useEffect(() => {
    if (!token) return;

    const checkTokenValidity = async () => {
      try {
        // 🛡️ JWT expiration check (optional)
        if (!checkTokenExpiration(token)) {
          throw new Error("Token expired");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) logout();
      } catch (err) {
        console.error("Token check failed:", err);
        logout();
      }
    };

    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // 🔑 Login handler
  const login = async (email, password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        return { success: false, error: data.error || "Invalid credentials" };
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user || data);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error. Please check your connection." };
    }
  };

  // 📝 Registration handler with auto-login
  const register = async (email, password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      // 🔄 Auto-login after successful registration
      return await login(email, password);
    } catch (err) {
      console.error("Registration error:", err);
      return { success: false, error: "Network error. Please try again later." };
    }
  };

  // 🚪 Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  // ⏳ Token expiration check utility
  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};


