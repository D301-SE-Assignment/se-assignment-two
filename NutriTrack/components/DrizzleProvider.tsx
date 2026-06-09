import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, Suspense, useContext, useMemo } from "react";
import { Platform, Text, View} from "react-native";
import * as schema from "@/assets/db/schema"

const DrizzleContext = createContext<ExpoSQLiteDatabase<typeof schema> | null>(null)

type Migrations =
{
    journal:
    {
        entries:
        {
            idx: number;
            when: number;
            tag: string;
            breakpoints: boolean;
        }[];
    };
    migrations: Record<string, string>;
}

function DrizzleCore({children, migrations, loadingScreen, debug = false}: { children: ReactNode, migrations: Migrations, loadingScreen: ReactNode, debug?: boolean })
{
    const expoDB = useSQLiteContext()
    const drizzleDB = drizzle<typeof schema>(expoDB);//useMemo(() => drizzle(expoDB), [expoDB])
    const { success, error } = useMigrations(drizzleDB, migrations)
  
    if (debug) useDrizzleStudio(expoDB)

    if (error)
        return (
            <View>
                <Text>Migration Error: {error.message}</Text>
            </View>
        )
    if (!success)
        return loadingScreen

    return (
        <DrizzleContext.Provider value={drizzleDB}>
            {children}
        </DrizzleContext.Provider>
    )
}

export function DrizzleProvider({children, databaseName, migrations, loadingScreen, debug = false}: { children: ReactNode, databaseName: string, migrations: Migrations, loadingScreen: ReactNode, debug?: boolean })
{
	return (
        <Suspense fallback={loadingScreen}>
                <SQLiteProvider
                    databaseName={ databaseName }
                    options={{ enableChangeListener: true }}
                    useSuspense>
                    <DrizzleCore migrations={migrations} loadingScreen={loadingScreen} debug={debug}>
                        {children}
                    </DrizzleCore>
                </SQLiteProvider>
        </Suspense>
    )
}

export function useDrizzleContext()
{
    const context = useContext(DrizzleContext)

    if (!context) throw new Error('useDrizzleContext() must be used within a <DrizzleProvider>')

    return context
}