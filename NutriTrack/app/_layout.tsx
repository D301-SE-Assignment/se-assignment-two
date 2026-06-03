import "@/global.css"
import { Stack, SplashScreen } from 'expo-router';
import { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { SQLiteProvider, SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';
import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/assets/drizzle/migrations';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

export const DATABASE_NAME = 'nutritrack'

let globalExpoDb: SQLiteDatabase | null = null;
export let db: ExpoSQLiteDatabase<Record<string, never>> | null = null;

SplashScreen.preventAutoHideAsync().catch(() => {});

function NativeStudioDebugger({ expoDb }: { expoDb: SQLiteDatabase }) {
  useDrizzleStudio(expoDb);
  console.log("Drizzle Studio Connected to the database successfully.")
  return null;
}

function AppNavigator() {
	const { success: migrationsLoaded, error: migrationError } = useMigrations(db!, migrations);

	useEffect(() => {
		if (migrationError) {
		console.error("Drizzle Migration Failed: ", migrationError);
		}
		if (migrationsLoaded) {
		console.log("Migrations loaded successfully!");
		SplashScreen.hideAsync().catch(() => {});
		}
	}, [migrationsLoaded, migrationError]);

	if (!migrationsLoaded) {
		return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
		</View>
		);
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
	const [isDbReady, setIsDbReady] = useState(false);
	return (
		<Suspense fallback={<ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />}>
		<SQLiteProvider
			databaseName={DATABASE_NAME}
			options={{ enableChangeListener: true }}
			onInit={async (nativeDb) => {
			console.log("SQLiteProvider onInit started.");
			globalExpoDb = nativeDb;
			db = drizzle(nativeDb);
			setIsDbReady(true)
			}}
			useSuspense 
		>
			{console.log("RootLayout rendered. isDbReady:", isDbReady, "globalExpoDb:", globalExpoDb)}
			{isDbReady && globalExpoDb && (
			<NativeStudioDebugger expoDb={globalExpoDb} />
			)}
			<AppNavigator />
		</SQLiteProvider>
		</Suspense>
	);
}
