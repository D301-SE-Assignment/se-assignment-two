import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopColor: "#f3f4f6",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients/index"
        options={{
          title: "Patients",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="people" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="switch_profile"
        options={{
          title: "Switch",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="swap-horiz" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="person" color={color} />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="test" options={{ href: null }} />
      <Tabs.Screen name="LoginScreen" options={{ href: null }} />
      <Tabs.Screen name="RegisterScreen" options={{ href: null }} />
      <Tabs.Screen name="meals" options={{ href: null }} />
      <Tabs.Screen name="weight" options={{ href: null }} />
      <Tabs.Screen name="patients/add" options={{ href: null }} />
      <Tabs.Screen name="patients/[id]" options={{ href: null }} />
    </Tabs>
  );
}
