import { Platform, StyleSheet, View, ScrollView, Button, Text, TextInput, Pressable, Alert } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite'
import { User } from '@/assets/db/types'
import { useState } from 'react';
import { router } from 'expo-router';


export default function HomeScreen()
{
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const db = useSQLiteContext();

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

    try
    {
      await db.runAsync(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email.trim().toLowerCase(), password]
      )

      console.log("Success", `Account created! You can now log in.`)
      Alert.alert("Success", `Account created! You can now log in.`)
      router.replace('/login')
    }
    catch (error)
    {
      console.error(error)
      Alert.alert("Database Error", "Something went wrong while registering.")
    }
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