import { useRouter } from "expo-router";
import React from "react";
// nest it alongside PatientProvider
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePatientContext } from "./context/PatientContext";

const CURRENT_USER = "Bibek "; // 🔧 swap with auth context later
const ENERGY_GOAL = 1000; // 🔧 swap with settings context later
const CONSUMED = 800; // 🔧 swap with meal context later

const GREETINGS = {
  morning: {
    text: "Good morning",
    emoji: "🥗",
    tagline: "Ready to log today's meals?",
  },
  afternoon: {
    text: "Good afternoon",
    emoji: "🍽️",
    tagline: "How's your nutrition tracking going?",
  },
  evening: {
    text: "Good evening",
    emoji: "🌿",
    tagline: "Time to review today's dietary data.",
  },
};

function getTimeOfDay(): keyof typeof GREETINGS {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function HomeScreen() {
  const { loading } = usePatientContext();
  const router = useRouter();
  const tod = getTimeOfDay();
  const greeting = GREETINGS[tod];
  const remaining = Math.max(ENERGY_GOAL - CONSUMED, 0);
  const pct = Math.min(Math.round((CONSUMED / ENERGY_GOAL) * 100), 100);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Greeting */}
      <View className="bg-white mx-4 mt-14 rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center">
            <Text className="text-2xl">{greeting.emoji}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-400">{greeting.text},</Text>
            <Text className="text-xl font-bold text-gray-800">
              {CURRENT_USER} 👋
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-500">{greeting.tagline}</Text>
      </View>

      {/* Daily Calories */}
      <View className="bg-white mx-4 mt-3 rounded-2xl p-4 border border-gray-100">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Daily calories
        </Text>
        <View className="flex-row items-baseline gap-1 mb-1">
          <Text className="text-3xl font-bold text-gray-800">{CONSUMED}</Text>
          <Text className="text-sm text-gray-400">/ {ENERGY_GOAL} kcal</Text>
        </View>
        <Text className="text-sm text-gray-400 mb-3">
          {remaining} kcal remaining today
        </Text>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-2 bg-green-500 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-300">0 kcal</Text>
          <Text className="text-xs text-gray-400">{pct}% of goal</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white mx-4 mt-3 rounded-2xl p-4 border border-gray-100">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Quick actions
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <ActionTile
            icon="✏️"
            bg="bg-green-50"
            label="Record meal"
            sub="Log food intake"
            onPress={() => router.push("/(pages)/meals")}
          />
          <ActionTile
            icon="⚖️"
            bg="bg-blue-50"
            label="Update weight"
            sub="Track body weight"
            onPress={() => router.push("/(pages)/weight")}
          />
          <ActionTile
            icon="📊"
            bg="bg-amber-50"
            label="Daily report"
            sub="View today's summary"
            onPress={() => router.push("./(pages)/report")} // 🔧 swap with actual report page
          />
          <ActionTile
            icon="🎯"
            bg="bg-purple-50"
            label="Energy goal"
            sub="Adjust calorie target"
            onPress={() => router.push("./(pages)/settings/goal")} //swap with actual settings page
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ActionTile({
  icon,
  bg,
  label,
  sub,
  onPress,
}: {
  icon: string;
  bg: string;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-xl p-3"
      style={{ width: "48%" }}
      activeOpacity={0.7}
    >
      <View
        className={`w-8 h-8 ${bg} rounded-lg items-center justify-center mb-2`}
      >
        <Text className="text-lg">{icon}</Text>
      </View>
      <Text className="text-sm font-semibold text-gray-800">{label}</Text>
      <Text className="text-xs text-gray-400 mt-0.5">{sub}</Text>
    </TouchableOpacity>
  );
}
