"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Automatically sync basic Google Auth profile data to Firestore
        // This is optional — the Python backend may not be running
        try {
          const names = currentUser.displayName ? currentUser.displayName.split(" ") : ["User"];
          const profileData = {
            personal_info: {
              first_name: names[0],
              last_name: names.length > 1 ? names.slice(1).join(" ") : "",
              full_name: currentUser.displayName || "User",
              email: currentUser.email || ""
            }
          };
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          await fetch(`http://localhost:8000/api/extension/profile?user_id=${currentUser.uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
            signal: controller.signal
          }).catch(() => {});
          clearTimeout(timeout);
        } catch {
          // Silently ignore — Python backend is optional
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
