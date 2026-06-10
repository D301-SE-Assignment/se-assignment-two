import { Image } from 'expo-image';
import { Platform, StyleSheet, View, ScrollView, Button, Text, TextInput, Pressable, Alert } from 'react-native';

import { Link } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/assets/db/schema'
import * as Crypto from 'expo-crypto'
import { and, eq, getTableColumns } from 'drizzle-orm';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SQLiteTable, SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { useDrizzleContext } from '@/components/DrizzleProvider';
import { useAuth } from '@/components/AuthProvider';

export default function HomeScreen()
{
  const drizzleDB = useDrizzleContext()
  const auth = useAuth()

  async function addUser(email:string, password:string)
  {
    return (
      await drizzleDB.insert(schema.users)
        .values(
          {
            email: email.trim().toLowerCase(),
            password: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
          })
        .returning()
      )[0]
  }

  const [xmlData1, setXmalData1] = useState('');
  const [xmlData2, setXmalData2] = useState('');
  const [xmlData3, setXmalData3] = useState('');

  async function printTable(table: SQLiteTable, setXmlData: Dispatch<SetStateAction<string>>)
  {
    try
    {
      const cols = Object.keys(getTableColumns(table))
      const rows = await drizzleDB.select().from(table)

      let xmlString = `${cols.map((key) => `${key}`).join('\t')}\n`
      if (rows.length > 0)
      {
        rows.forEach(user =>
        {
          xmlString += `${Object.values(user).map((value) => `${value}`).join('\t')}\n`
        })
      }
      xmlString += `\n`
      setXmlData(xmlString);
    }
    catch (error)
    {
      console.error("Drizzle Fetch Error: ", error)
    }
  }

  async function getProfiles(token: string|null,  setXmlData: Dispatch<SetStateAction<string>>)
  {
    const result = await drizzleDB.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.token, token ?? ''))
      .innerJoin(schema.users, eq(schema.sessions.user_id, schema.users.id))
      .leftJoin(schema.profiles, eq(schema.sessions.profile_id, schema.profiles.id))

      console.info(result)
      setXmlData(JSON.stringify(result, null, '\t'))
  }

  return (
    <ScrollView className="justify-center p-10 flex-1">
      <Pressable className="self-center" onPress={()=>printTable(schema.users, setXmalData1)}><Text className='text-blue-500'>Print users</Text></Pressable>
      <Text>{xmlData1}</Text>
      <Pressable className="self-center" onPress={()=>printTable(schema.sessions, setXmalData2)}><Text className='text-blue-500'>Print sessions</Text></Pressable>
      <Text>{xmlData2}</Text>

      <Pressable className="self-center" onPress={()=>getProfiles(auth.token, setXmalData3)}><Text className='text-blue-500'>Print authorized DB</Text></Pressable>
      <Text>{xmlData3}</Text>
    </ScrollView>
  );
};