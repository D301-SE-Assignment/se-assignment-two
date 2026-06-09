import { Stack } from "expo-router"
import "../global.css"
import * as SQLite from 'expo-sqlite'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { PatientProvider, usePatientContext } from "./(pages)/context/PatientContext"
import { migration } from "@/assets/db/nutri-track"
 
export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="nutri-track.db"
      assetSource={{ assetId: require("@/assets/db/nutri-track.db") }}
      onInit={migrateDBIfNeeded}
    >
      <PatientProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PatientProvider>
    </SQLiteProvider>
  );
}

//const db = useSQLiteContext()
//const db2 = await SQLite.openDatabaseAsync('nutri-track.db')

async function migrateDBIfNeeded(db:SQLite.SQLiteDatabase)
{
	console.log("Initializing Database!")
	try
	{
		await db.execAsync(migration)
		console.log("Database initialized successfully!");
	}
	catch (error)
	{
		console.error("Error initializing database:", error);
	}
}
