import "@/global.css"
import { Stack } from 'expo-router';
import { ActivityIndicator, Platform } from 'react-native';
import migrations from "@/assets/drizzle/migrations";
import { DrizzleProvider } from "@/components/DrizzleProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { PatientProvider } from "@/components/PatientContext";
import { MealProvider } from "@/components/MealContext";
import { WeightProvider } from "@/components/WeightContext";

export const DATABASE_NAME = Platform.OS === 'web' ? ':memory:' : 'nutritrack'
//export const DATABASE_NAME = 'nutritrack'

export default function RootLayout()
{
	return (
	<DrizzleProvider databaseName={DATABASE_NAME} migrations={migrations} loadingScreen={<ActivityIndicator size="large" className=""/>}
		debug={true}>
		<AuthProvider>
			<PatientProvider>
        <MealProvider>
          <WeightProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </WeightProvider>
        </MealProvider>
			</PatientProvider>
		</AuthProvider>
	</DrizzleProvider>
	)
}
