import { migration } from "@/assets/db/nutri-track";
import { Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import "../global.css";
import { AuthProvider, useAuthContext } from "./(pages)/context/AuthContext";
import { GoalProvider } from "./(pages)/context/GoalContext";
import { MealProvider } from "./(pages)/context/MealContext";
import { PatientProvider } from "./(pages)/context/PatientContext";
import { WeightProvider } from "./(pages)/context/WeightContext";

function Migrator({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.execAsync(migration)
      .then(() => setReady(true))
      .catch((err) => console.error("Migration failed:", err));
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const onAuthScreen =
      segments.includes("LoginScreen") || segments.includes("RegisterScreen");

    if (!currentUser && !onAuthScreen) {
      router.replace("/LoginScreen");
    } else if (currentUser && onAuthScreen) {
      router.replace("/");
    }
  }, [currentUser, loading, segments]);

  if (loading) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="patients.db">
      <Migrator>
        <AuthProvider>
          <AuthGate>
            <PatientProvider>
              <MealProvider>
                <WeightProvider>
                  <GoalProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                  </GoalProvider>
                </WeightProvider>
              </MealProvider>
            </PatientProvider>
          </AuthGate>
        </AuthProvider>
      </Migrator>
    </SQLiteProvider>
  );
}
