import { useEffect, useState } from "react";
import { api } from "./api";

const STORAGE_KEY = "gold_user_email";

export interface AuthUser {
  email: string;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const e = localStorage.getItem(STORAGE_KEY);
  return e ? { email: e } : null;
}

export function setStoredUser(email: string) {
  localStorage.setItem(STORAGE_KEY, email);
  window.dispatchEvent(new Event("auth:change"));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("auth:change"));
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const r = await api.post("/auth/login", { email, password });
  if (!r.data?.success) throw new Error(r.data?.error || "Login failed");
  setStoredUser(r.data.email);
  return { email: r.data.email };
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const r = await api.post("/auth/register", { email, password });
  if (!r.data?.success) throw new Error(r.data?.error || "Registration failed");
  setStoredUser(r.data.email);
  return { email: r.data.email };
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener("auth:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("auth:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}
