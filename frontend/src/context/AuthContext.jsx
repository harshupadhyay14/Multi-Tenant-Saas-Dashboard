import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [org, setOrg]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, if token exists — fetch current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          // Set first org as active by default
          if (res.data.user.memberships?.length > 0) {
            const membership = res.data.user.memberships[0];
            // orgId can be a string or populated object
            setOrg(membership.orgId);
          }
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    if (res.data.user.memberships?.length > 0) {
      const membership = res.data.user.memberships[0];
      // orgId can be a string or populated object
      const orgId = membership.orgId?._id || membership.orgId?.id || membership.orgId;
      setOrg(orgId);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOrg(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, org, setOrg, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);