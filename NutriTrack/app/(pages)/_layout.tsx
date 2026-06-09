import { router, Tabs } from 'expo-router';
import React from 'react';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/components/AuthProvider';

export default function TabLayout()
{
  function options(title: string, icon: any)
  {
    return{
      title: title,
      tabBarIcon: () => <MaterialIcons size={28} name={icon} />,
      //tabBarItemStyle: {display: 'none'}
    }
  }

  const auth = useAuth()
  if (!auth.isAuthenticated)
    router.replace('/login')

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
