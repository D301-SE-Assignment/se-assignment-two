import { Platform, StyleSheet, View, ScrollView, Button, Text, TextInput, Pressable, Alert } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite'
import { User } from '@/assets/db/types'
import { useState } from 'react';
import { router } from 'expo-router';

import * as Crypto from 'expo-crypto'



export default function HomeScreen()
{
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const db = useSQLiteContext();

  async function login()
  {
    if (!email || !password)
    {
      console.error("Error", "Please fill in all fields.")
      Alert.alert("Error", "Please fill in all fields.")
      return;
    }

    try
    {
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email.trim().toLowerCase(), await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)]
      )
      if (user)
      {
        console.log("Success", `Welcome back, ${user.email}`)
        Alert.alert("Success", `Welcome back, ${user.email}`)
        router.replace('/')
      }
      else
      {
        console.error("Failed", "Invalid email or password.", user)
        Alert.alert("Failed", "Invalid email or password.")
      }
    }
    catch (error)
    {
      console.error(error)
      Alert.alert("Database Error", "Something went wrong while logging in.")
    }
  }
  function register()
  {
    router.replace('/register')
  }

  //
  return (
    <View className="justify-center p-10 flex-1">
      <Text className="text-4xl font-bold self-center mb-4">Nutri-Track</Text>
      
      <Text className="text-xl">Email Address</Text>
      <TextInput className="border rounded-full p-2 mb-2" autoComplete='email' autoFocus keyboardType='email-address' returnKeyType='next' placeholder='example@example.com'
        value={email} onChangeText={setEmail}></TextInput>
      
      <Text className="text-xl">Password</Text>
      <TextInput  className="border rounded-full p-2 mb-4" autoComplete='email' keyboardType='default' returnKeyType='go' placeholder='password' secureTextEntry={true}
        value={password} onChangeText={setPassword}></TextInput>
      
      <Pressable className="bg-blue-500 text-white self-center border rounded-full py-1 px-2 w-min" onPress={login}><Text>Login</Text></Pressable>
      <Pressable className="self-center" onPress={register}><Text>Don't have an Account? <Text className="text-blue-500">Register</Text></Text></Pressable>
    </View>
  )
};