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
                if (data.email) {
                    setUser(data);
                } else {
                    logout();
                }
            })
            .catch((err) => {
                console.error("❌ Fetch error:", err);
                logout();
            });
    }
}, []);


  // ✅ Login function
  const login = async (email, password) => {
    try {
        console.log("🟢 Attempting login..."); // ✅ Debugging

        const response = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("🟢 Login Response:", data); // ✅ Debugging

        if (data.token) {
            console.log("✅ Token received:", data.token);
            localStorage.setItem("token", data.token);
            setToken(data.token);
            console.log("✅ Token saved in localStorage:", localStorage.getItem("token"));

            // ✅ Set user state properly
            setUser({ email: data.email, role: data.role });
            console.log("✅ User state updated:", { email: data.email, role: data.role });

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
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

