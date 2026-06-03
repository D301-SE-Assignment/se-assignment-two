import "@/global.css"
import { Stack } from 'expo-router';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/assets/drizzle/migrations';

export const DATABASE_NAME = 'nutritrack'

export default function RootLayout()
{
	const exooDb = openDatabaseSync(DATABASE_NAME)
	const db = drizzle(exooDb)
	const { success, error } = useMigrations(db, migrations)
	return (
	<Suspense fallback={<ActivityIndicator size="large"/>}>
		<SQLiteProvider
			databaseName={ DATABASE_NAME }
			options={{ enableChangeListener: true }}
			useSuspense>
				<Stack screenOptions={{ headerShown: false }}/>
		</SQLiteProvider>
	</Suspense>
	)
}
