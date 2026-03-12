"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User, Wallet, YouTubeChannel } from "./api";
import { api } from "./api";

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  channel: YouTubeChannel | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    wallet: null,
    channel: null,
    token: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const data = await api.getMe();
      setState((s) => ({
        ...s,
        user: data.user,
        wallet: data.wallet,
        channel: data.channel,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, user: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setState((s) => ({ ...s, token: saved }));
      refresh();
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [refresh]);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("token", token);
      setState((s) => ({ ...s, token }));
      refresh();
    },
    [refresh]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({
      user: null,
      wallet: null,
      channel: null,
      token: null,
      loading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
