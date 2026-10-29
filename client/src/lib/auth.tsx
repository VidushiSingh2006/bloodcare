import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, persistToken } from "./api";

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "DONOR" | "PATIENT";
  phone: string | null;
  city: string | null;
  bloodGroup: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<AppUser>;
  register: (body: Record<string, unknown>) => Promise<AppUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ user: AppUser }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password, rememberMe) {
        const r = await api<{ token: string; user: AppUser }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, rememberMe }),
        });
        persistToken(r.token, rememberMe);
        setUser(r.user);
        return r.user;
      },
      async register(body) {
        const r = await api<{ token: string; user: AppUser }>("/auth/register", {
          method: "POST",
          body: JSON.stringify(body),
        });
        persistToken(r.token, false);
        setUser(r.user);
        return r.user;
      },
      logout() {
        clearToken();
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
