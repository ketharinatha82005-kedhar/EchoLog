import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("fieldnotes_token")) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("fieldnotes_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async credentials => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("fieldnotes_token", data.token); setUser(data.user);
  };
  const register = async details => {
    const { data } = await api.post("/auth/register", details);
    localStorage.setItem("fieldnotes_token", data.token); setUser(data.user);
  };
  const logout = () => { localStorage.removeItem("fieldnotes_token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
