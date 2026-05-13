import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, ScrollView, Text, TextInput } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';


export default function TabLayout()
{

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
