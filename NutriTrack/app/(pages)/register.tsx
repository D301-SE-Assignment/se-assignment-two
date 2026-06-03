import { Platform, StyleSheet, View, ScrollView, Button, Text, TextInput, Pressable, Alert } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/assets/db/schema'
import { useState } from 'react';
import { router } from 'expo-router';

import * as Crypto from 'expo-crypto'
import { and, eq } from 'drizzle-orm';

export default function HomeScreen()
{
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, {schema})

  async function login()
  {
      router.replace('/login')
  }

  async function register()
  {
    if (!email || !password || !password2)
    {
      console.error("Error", "Please fill in all fields.")
      Alert.alert("Error", "Please fill in all fields.")
      return;
    }

    if (password !== password2)
    {
      console.error("Error", "Passwords do not match.")
      Alert.alert("Error", "Passwords do not match.")
      return;
    }

    
    const users = await drizzleDb.select()
          .from(schema.users)
          .where(eq(schema.users.email, email.trim().toLocaleLowerCase()))
    if (users.length > 0)
    {
      console.error("Error", "Email already in use.")
      Alert.alert("Error", "Email already in use.")
      return;
    }

    const [user] = await drizzleDb.insert(schema.users)
      .values({email: email.trim().toLowerCase(), password: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)})
      .returning()

    const token = Crypto.randomUUID()
    const TIMEOUT_MILISECONDS = 1000 * 60 //1 minute in miliseconds
    drizzleDb.insert(schema.sessions).values({token: token, user_id: user.id, expiry: Date.now() + TIMEOUT_MILISECONDS})

    console.log("Success", `Account created! You can now log in.`)
    Alert.alert("Success", `Account created! You can now log in.`)
    router.replace('/login') //redirect to login
  }
  return (
    <View className="justify-center p-10 flex-1">
      <Text className="text-4xl font-bold self-center mb-4">Nutri-Track</Text>
      
      <Text className="text-xl">Email Address</Text>
      <TextInput className="border rounded-full p-2 mb-2" autoComplete='email' autoFocus keyboardType='email-address' returnKeyType='next' placeholder='example@example.com'
        value={email} onChangeText={setEmail}></TextInput>
      
      <Text className="text-xl">Password</Text>
      <TextInput  className="border rounded-full p-2 mb-4" autoComplete='email' keyboardType='default' returnKeyType='next' placeholder='password' secureTextEntry={true}
        value={password} onChangeText={setPassword}></TextInput>
      
      <Text className="text-xl">Confirm Password</Text>
      <TextInput  className="border rounded-full p-2 mb-4" autoComplete='email' keyboardType='default' returnKeyType='go' placeholder='password' secureTextEntry={true}
        value={password2} onChangeText={setPassword2}></TextInput>
      
      <Pressable className="bg-blue-500 text-white self-center border rounded-full py-1 px-2 w-min" onPress={register}><Text>Register</Text></Pressable>
      <Pressable className="self-center" onPress={login}><Text>Already have an Account? <Text className="text-blue-500">Login</Text></Text></Pressable>
    </View>
  )
};