import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGoalContext } from "./context/GoalContext";
import { useMealContext } from "./context/MealContext";
import { usePatientContext } from "./context/PatientContext";

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

function isToday(isoDateTime: string): boolean {
  const d = new Date(isoDateTime);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function HomeScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { getPatientById, loading: patientsLoading } = usePatientContext();
  const { getMealsByPatientId, loading: mealsLoading } = useMealContext();
  const {
    getGoalByPatientId,
    setGoal,
    loading: goalsLoading,
  } = useGoalContext();

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  const tod = getTimeOfDay();
  const greeting = GREETINGS[tod];
  const loading = patientsLoading || mealsLoading || goalsLoading;

  const patient = patientId ? getPatientById(patientId) : undefined;

  const consumed = useMemo(() => {
    if (!patientId) return 0;
    return getMealsByPatientId(patientId)
      .filter((m) => isToday(m.dateTime))
      .reduce((sum, m) => sum + m.calories, 0);
  }, [patientId, getMealsByPatientId]);

  const energyGoal = patientId ? getGoalByPatientId(patientId) : 0;
  const remaining = Math.max(energyGoal - consumed, 0);
  const pct =
    energyGoal > 0
      ? Math.min(Math.round((consumed / energyGoal) * 100), 100)
      : 0;

  function openGoalModal() {
    setGoalInput(String(energyGoal));
    setGoalModalVisible(true);
  }

  async function saveGoal() {
    const parsed = parseInt(goalInput, 10);
    if (patientId && !isNaN(parsed) && parsed > 0) {
      await setGoal(patientId, parsed);
    }
    setGoalModalVisible(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Same "no patient selected" pattern used in meals.tsx / weight.tsx / report.tsx
  if (!patientId || !patient) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-4xl mb-4">🏠</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No patient selected
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Open a patient profile and tap "Dashboard" to see their daily summary
          here.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(pages)/patients")}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">View Patients</Text>
        </TouchableOpacity>
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
              {patient.name} 👋
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-500">{greeting.tagline}</Text>
      </View>

      {/* Daily Calories */}
      <View className="bg-white mx-4 mt-3 rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Daily calories
          </Text>
          <TouchableOpacity onPress={openGoalModal} activeOpacity={0.7}>
            <Text className="text-xs font-semibold text-green-600">
              Edit goal
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-baseline gap-1 mb-1">
          <Text className="text-3xl font-bold text-gray-800">{consumed}</Text>
          <Text className="text-sm text-gray-400">/ {energyGoal} kcal</Text>
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
            onPress={() =>
              router.push(`/(pages)/meals?patientId=${patient.id}`)
            }
          />
          <ActionTile
            icon="⚖️"
            bg="bg-blue-50"
            label="Update weight"
            sub="Track body weight"
            onPress={() =>
              router.push(`/(pages)/weight?patientId=${patient.id}`)
            }
          />
          <ActionTile
            icon="📊"
            bg="bg-amber-50"
            label="Daily report"
            sub="View today's summary"
            onPress={() =>
              router.push(`/(pages)/report?patientId=${patient.id}`)
            }
          />
          <ActionTile
            icon="🎯"
            bg="bg-purple-50"
            label="Energy goal"
            sub="Adjust calorie target"
            onPress={openGoalModal}
          />
        </View>
      </View>

      {/* Edit Goal Modal */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-8">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-base font-bold text-gray-800 mb-1">
              Set daily calorie goal
            </Text>
            <Text className="text-xs text-gray-400 mb-4">
              For {patient.name}
            </Text>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              placeholder="e.g. 2000"
              className="border border-gray-200 rounded-xl px-3 py-2 text-base text-gray-800 mb-4"
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setGoalModalVisible(false)}
                className="px-4 py-2 rounded-xl"
              >
                <Text className="text-gray-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveGoal}
                className="px-4 py-2 rounded-xl bg-green-500"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
