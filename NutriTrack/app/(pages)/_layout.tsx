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
      <Tabs.Screen name="index" options={options("Dashboard", "home")}/>
      <Tabs.Screen name="patients/index" options={options("Patients", "group")}/>
      <Tabs.Screen name="patients/id" options={options("Patients", "person")}/>
      <Tabs.Screen name="patients/add" options={options("New Profile", "person-add")}/>
      <Tabs.Screen name="logout" options={options("Logout", "logout")}/>
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
