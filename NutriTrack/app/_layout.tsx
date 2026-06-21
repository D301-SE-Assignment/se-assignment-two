import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import "../global.css";
import { MealProvider } from "./(pages)/context/MealContext";
import { PatientProvider } from "./(pages)/context/PatientContext";
import { WeightProvider } from "./(pages)/context/WeightContext";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="patients.db">
      <PatientProvider>
        <MealProvider>
          <WeightProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </WeightProvider>
        </MealProvider>
      </PatientProvider>
    </SQLiteProvider>
  );
}
