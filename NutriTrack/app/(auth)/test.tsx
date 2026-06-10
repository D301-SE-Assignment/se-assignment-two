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
import { useAuth } from '@/components/AuthProvider';
import { useDrizzleContext } from '@/components/DrizzleProvider';

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

  return (
    <ScrollView>
      <Text>{useRoute().name}</Text>
      <Pressable className="self-center" onPress={()=>addUser('test', 'test1')}><Text className='text-blue-500'>Add test user</Text></Pressable>

      <Pressable className="self-center" onPress={()=>printTable(schema.users, setXmalData1)}><Text className='text-blue-500'>Print users</Text></Pressable>
      <Text>{xmlData1}</Text>
      <Pressable className="self-center" onPress={()=>printTable(schema.sessions, setXmalData2)}><Text className='text-blue-500'>Print sessions</Text></Pressable>
      <Text>{xmlData2}</Text>
    </ScrollView>
  );
};