import "@/global.css"
import { Stack } from 'expo-router';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { SQLiteProvider, openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';

export const DATABASE_NAME = Platform.OS === 'web' ? ':memory:' : 'nutritrack'

export default function RootLayout()
{
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
