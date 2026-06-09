import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'
import { Platform } from "react-native"
import { useDrizzleContext } from "./DrizzleProvider"
import * as schema from "@/assets/db/schema"
import { eq } from "drizzle-orm"
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite"

interface AuthContextType
{
	token: string|null,
	isAuthenticated: boolean,
	login: (token: string) => Promise<void>,
	logout: () => Promise<void>
}
const AuthContext = createContext<AuthContextType|null>(null)

export const TOKEN_STORAGE = 'session-token'

export function AuthProvider({children}: { children: ReactNode })
{
	const [token, setToken] = useState<string|null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const drizzleDB = useDrizzleContext()

	useEffect(() =>
	{
		const bootstrapAsync = async () =>
		{
			try
			{
				const userToken = await getAuthToken() ?? ''

				const [session] = await drizzleDB.select().from(schema.sessions).where(eq(schema.sessions.token, userToken)) ?? []
				if (session)
					setToken(session.token)
			}
			catch (error) {}
			finally
			{
				setIsLoading(false)
			}

		}
		bootstrapAsync()
	}, [])

	async function login(token: string)
	{
		await setAuthToken(token)
		setToken(token)
	}
	async function logout()
	{
		await removeAuthToken()
		setToken(null)
	}
	if (isLoading)
		return null
	return (
		<AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout}}>
            {children}
        </AuthContext.Provider>
	)
}

export function useAuth()
{
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth() must be used within an <AuthProvider>')
    return context
}

async function getAuthToken()
{
    if (Platform.OS === 'web')
    {
        return localStorage.getItem(TOKEN_STORAGE)
    }
    else
    {
        return await getItemAsync(TOKEN_STORAGE)   
    }
}

async function setAuthToken(token: string)
{
    if (Platform.OS === 'web')
    {
        localStorage.setItem(TOKEN_STORAGE, token)
    }
    else
    {
        await setItemAsync(TOKEN_STORAGE, token)   
    }
}

async function removeAuthToken()
{
    if (Platform.OS === 'web')
    {
        localStorage.removeItem(TOKEN_STORAGE)
    }
    else
    {
        await deleteItemAsync(TOKEN_STORAGE)   
    }
}