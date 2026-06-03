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
      <Tabs.Screen
        name="test"
        options=
        {{
          tabBarItemStyle: {display: 'none'}
        }}
      />
    </Tabs>
  );
}
