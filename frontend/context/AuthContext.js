import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              setUser(data);
            } else {
              logout();
            }
          })
          .catch(() => logout());
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
        }
        setToken(data.token);
        setUser({ id: data.userId, email: data.email, role: data.role });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Something went wrong" };
    }
  };

  const register = async (email, password, role = "SELLER") => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }), // ✅ Ensure role is sent
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
  
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



