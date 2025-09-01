import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { loginSuccess, logout as logoutAction } from "../store/slices/userSlice";

type AuthContextType = {
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);
  const [loading, setLoading] = useState(true);

  // One-time hydration on mount
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setLoading(true);
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("LOCAL_USER") : null;
        if (!cancelled && stored) {
          const user = JSON.parse(stored);
          dispatch(loginSuccess({ user }));
        } else if (!cancelled) {
          dispatch(logoutAction());
        }
      } catch {
        if (!cancelled) {
          dispatch(logoutAction());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrate();

    // Optional: re-check when tab becomes visible (handles cookies cleared / new login in another tab)
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        hydrate();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dispatch]);

  const value = { loading, isAuthenticated };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
