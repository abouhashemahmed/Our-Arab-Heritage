import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// ✅ Custom Hook for Authentication
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || null;
    }
    return null;
  });

  // ✅ Load user from token when the app starts
  useEffect(() => {
    console.log("🔄 Checking token on app start...");
    const storedToken = localStorage.getItem("token");
    console.log("🔄 Stored Token:", storedToken);

    if (storedToken) {
      setToken(storedToken);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(res => {
          console.log("🔄 /me Response Status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("🔄 /me Response Data:", data);
          if (data.id) {
            setUser(data); // ✅ Store full user data
          } else {
            logout();
          }
        })
        .catch(err => {
          console.error("❌ Fetch error:", err);
          logout();
        });
    }
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    try {
      console.log("🟢 Attempting login...");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, { // ✅ Use dynamic API URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🟢 Login Response:", data);

      if (data.token) {
        console.log("✅ Token received:", data.token);
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // ✅ Store full user data (id, email, role)
        setUser({ id: data.userId, email: data.email, role: data.role });

        return { success: true };
      } else {
        console.log("❌ No token received. Error:", data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: "Something went wrong" };
    }
  };

  // ✅ Logout function
  const logout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login"; // ✅ Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


