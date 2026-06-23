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
        name="LoginScreen"
        options={{
          title: "Login",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pRegisterScreen"
        options={{
          title: "Register",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="person-add" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
