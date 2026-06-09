import "@/global.css"
import { Stack } from 'expo-router';
import { ActivityIndicator, Platform } from 'react-native';
import migrations from "@/assets/drizzle/migrations";
import { DrizzleProvider } from "@/components/DrizzleProvider";

export const DATABASE_NAME = Platform.OS === 'web' ? ':memory:' : 'nutritrack'
//export const DATABASE_NAME = 'nutritrack'

export default function RootLayout()
{
	return (
	<DrizzleProvider databaseName={DATABASE_NAME} migrations={migrations} loadingScreen={<ActivityIndicator size="large" className=""/>}
		debug={true}>
		<Stack screenOptions={{ headerShown: false }}/>
	</DrizzleProvider>
	)
}
