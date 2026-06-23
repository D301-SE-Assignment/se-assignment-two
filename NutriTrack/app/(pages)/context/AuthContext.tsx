import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { User } from "@/assets/db/types";

// ── Types ────────────────────────────────────────────────────────────────────

type AuthResult = { success: boolean; message?: string };

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "auth_user_id";

async function hashPassword(plain: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, plain);
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem(SESSION_KEY);
        if (storedId) {
          const user = await db.getFirstAsync<User>(
            "SELECT * FROM users WHERE id = ?",
            [Number(storedId)],
          );
          if (user) {
            setCurrentUser(user);
          } else {
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (err) {
        console.warn("Failed to restore session:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const hashed = await hashPassword(password);
        const user = await db.getFirstAsync<User>(
          "SELECT * FROM users WHERE email = ? AND password = ?",
          [email.trim().toLowerCase(), hashed],
        );
        if (!user) {
          return { success: false, message: "Invalid email or password." };
        }
        setCurrentUser(user);
        await AsyncStorage.setItem(SESSION_KEY, String(user.id));
        return { success: true };
      } catch (err) {
        console.error("Login error:", err);
        return {
          success: false,
          message: "Something went wrong while logging in.",
        };
      }
    },
    [db],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const existing = await db.getFirstAsync<User>(
          "SELECT * FROM users WHERE email = ?",
          [email.trim().toLowerCase()],
        );
        if (existing) {
          return {
            success: false,
            message: "An account with that email already exists.",
          };
        }
        const hashed = await hashPassword(password);
        await db.runAsync("INSERT INTO users (email, password) VALUES (?, ?)", [
          email.trim().toLowerCase(),
          hashed,
        ]);
        return { success: true };
      } catch (err) {
        console.error("Register error:", err);
        return {
          success: false,
          message: "Something went wrong while registering.",
        };
      }
    },
    [db],
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const changePassword = useCallback(
    async (current: string, newPass: string): Promise<AuthResult> => {
      try {
        if (!currentUser) {
          return { success: false, message: "No user logged in." };
        }
        const hashedCurrent = await hashPassword(current);
        const valid = await db.getFirstAsync<User>(
          "SELECT * FROM users WHERE id = ? AND password = ?",
          [currentUser.id, hashedCurrent],
        );
        if (!valid) {
          return { success: false, message: "Current password is incorrect." };
        }
        const hashedNew = await hashPassword(newPass);
        await db.runAsync("UPDATE users SET password = ? WHERE id = ?", [
          hashedNew,
          currentUser.id,
        ]);
        return { success: true };
      } catch (err) {
        console.error("Change password error:", err);
        return {
          success: false,
          message: "Something went wrong while changing password.",
        };
      }
    },
    [db, currentUser],
  );

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user logged in." };
      }
      await db.runAsync("DELETE FROM users WHERE id = ?", [currentUser.id]);
      setCurrentUser(null);
      await AsyncStorage.removeItem(SESSION_KEY);
      return { success: true };
    } catch (err) {
      console.error("Delete account error:", err);
      return {
        success: false,
        message: "Something went wrong while deleting account.",
      };
    }
  }, [db, currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
