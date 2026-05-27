import { Stack } from "expo-router"
import "../global.css"
import * as SQLite from 'expo-sqlite'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { Profile, Session, User } from '@/assets/db/types'
import { migration } from "@/assets/db/nutri-track"
 
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
		await db.execAsync(migration)
		console.log("Database initialized successfully!");
		console.info(await db.getAllAsync<Session>('SELECT * FROM sessions'))
		console.info(await db.getAllAsync<User>('SELECT * FROM users'))
		console.info(await db.getAllAsync<Profile>('SELECT * FROM profiles'))
	}
	catch (error)
	{
		console.error("Error initializing database:", error);
	}
}
