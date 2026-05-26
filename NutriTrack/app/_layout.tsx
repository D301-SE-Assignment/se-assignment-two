import { Stack } from "expo-router"
import "../global.css"
import * as SQLite from 'expo-sqlite'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { User } from '@/assets/db/types'
 
export default function RootLayout()
{
	return <SQLiteProvider databaseName="nutri-track.db" assetSource={{ assetId: require('@/assets/db/nutri-track.db') }} onInit={migrateDBIfNeeded}><Stack screenOptions={{ headerShown: false }}/></SQLiteProvider>
}

//const db = useSQLiteContext()
//const db2 = await SQLite.openDatabaseAsync('nutri-track.db')

async function migrateDBIfNeeded(db:SQLite.SQLiteDatabase)
{
	console.log("Initializing Database!")
	try
	{
		await db.execAsync(`
			PRAGMA journal_mode = WAL;
			CREATE TABLE IF NOT EXISTS "users" (
				"id" INTEGER PRIMARY KEY,
				"email" TEXT NOT NULL,
				"password" TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS "profiles" (
				"id" INTEGER PRIMARY KEY,
				"user_id" INTEGER NOT NULL,
				"name" TEXT NOT NULL,
				"birthdate" TEXT NOT NULL,
				"gender" TEXT,
				"ethnicity" TEXT,
				"dietary_requirements" TEXT,
				"medical_conditions" TEXT,
				FOREIGN KEY ("user_id") REFERENCES "users" ("id")
			);
		`)
		console.log("Database initialized successfully!");
	}
	catch (error)
	{
		console.error("Error initializing database:", error);
	}
}
