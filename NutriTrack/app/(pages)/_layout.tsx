import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, ScrollView, Text, TextInput } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/assets/drizzle/migrations';
import { useSQLiteContext } from 'expo-sqlite'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'


export default function TabLayout()
{
  const expoDb = useSQLiteContext()
  const drizzleDb = drizzle(expoDb)
  const { success, error } = useMigrations(drizzleDb, migrations)

  useDrizzleStudio(expoDb)

  function options(title: string, icon: string)
  {
    return{
      title: title,
      tabBarIcon: () => <MaterialIcons size={28} name={icon} />,
      //tabBarItemStyle: {display: 'none'}
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarItemStyle: {display: 'flex'}
      }}>
      <Tabs.Screen
        name="index"
        options=
        {{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
          tabBarItemStyle: {display: 'flex'}
        }}
      />
      <Tabs.Screen name="login" options={options("Login", "login")}/>
      <Tabs.Screen name="register" options={options("Register", "web")}/>
      <Tabs.Screen
        name="test"
        options=
        {{
          title: 'DEBUG',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="bug-report" color={color} />,
          //tabBarItemStyle: {display: 'none'}
        }}
      />
    </Tabs>
  );
}
