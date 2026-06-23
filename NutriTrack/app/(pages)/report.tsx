import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DonutChart } from "./component/DonutChart";
import { Meal, MealType, useMealContext } from "./context/MealContext";
import { usePatientContext } from "./context/PatientContext";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: "🥣",
  lunch: "🥪",
  dinner: "🍽️",
  snack: "🍎",
};

const MEAL_TYPE_COLOR: Record<MealType, string> = {
  breakfast: "#f59e0b", // amber
  lunch: "#10b981", // emerald
  dinner: "#6366f1", // indigo
  snack: "#f43f5e", // rose
};

function toDateKey(date: Date): string {
  // Local date key, avoids UTC offset issues when comparing "same day"
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  if (toDateKey(date) === toDateKey(today)) return "Today";

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (toDateKey(date) === toDateKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DailyReportScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { getPatientById } = usePatientContext();
  const { getMealsByPatientId, loading } = useMealContext();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const patient = patientId ? getPatientById(patientId) : undefined;
  const allMeals = patientId ? getMealsByPatientId(patientId) : [];

  const dayMeals = useMemo(() => {
    const key = toDateKey(selectedDate);
    return allMeals
      .filter((m) => toDateKey(new Date(m.dateTime)) === key)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  }, [allMeals, selectedDate]);

  const totalCalories = useMemo(
    () => dayMeals.reduce((sum, m) => sum + m.calories, 0),
    [dayMeals],
  );

  const caloriesByType = useMemo(() => {
    const map: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };
    dayMeals.forEach((m) => {
      map[m.mealType] += m.calories;
    });
    return map;
  }, [dayMeals]);

  const chartData = useMemo(
    () =>
      MEAL_TYPES.map((type) => ({
        label: type,
        value: caloriesByType[type],
        color: MEAL_TYPE_COLOR[type],
      })),
    [caloriesByType],
  );

  function goToPreviousDay() {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 1);
      return next;
    });
  }

  function goToNextDay() {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });
  }

  const isToday = toDateKey(selectedDate) === toDateKey(new Date());

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!patientId || !patient) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-4xl mb-4">📊</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No patient selected
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Open a patient profile and tap "Daily Report" to view their summary.
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
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-500 text-sm">
            ← Back to {patient.name}
          </Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Daily Report</Text>
        <Text className="text-sm text-gray-500 mt-1">{patient.name}</Text>
      </View>

      {/* Date navigator */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={goToPreviousDay}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2"
        >
          <Text className="text-blue-500 text-lg">←</Text>
        </TouchableOpacity>

        <Text className="text-base font-semibold text-gray-800">
          {formatDateLabel(selectedDate)}
        </Text>

        <TouchableOpacity
          onPress={goToNextDay}
          disabled={isToday}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2"
        >
          <Text
            className={`text-lg ${isToday ? "text-gray-200" : "text-blue-500"}`}
          >
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total calories card */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Total Intake
        </Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-3xl font-bold text-gray-800">
            {totalCalories}
          </Text>
          <Text className="text-sm text-gray-400">kcal</Text>
        </View>
        <Text className="text-sm text-gray-400 mt-1">
          {dayMeals.length} {dayMeals.length === 1 ? "meal" : "meals"} logged
        </Text>
      </View>

      {/* Breakdown by meal type */}
      <View className="bg-white mx-4 mt-3 rounded-2xl p-4 border border-gray-100">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Breakdown
        </Text>

        {totalCalories === 0 ? (
          <View className="items-center py-4">
            <DonutChart
              data={chartData}
              centerLabel="0"
              centerSubLabel="kcal"
            />
            <Text className="text-sm text-gray-400 mt-4">
              Log a meal to see today's breakdown.
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <DonutChart
              data={chartData}
              centerLabel={String(totalCalories)}
              centerSubLabel="kcal"
            />
            <View className="flex-1 ml-5 gap-3">
              {MEAL_TYPES.map((type) => {
                const value = caloriesByType[type];
                const pct =
                  totalCalories > 0
                    ? Math.round((value / totalCalories) * 100)
                    : 0;
                return (
                  <View
                    key={type}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: MEAL_TYPE_COLOR[type],
                        }}
                      />
                      <Text className="text-sm text-gray-600">
                        {MEAL_TYPE_EMOJI[type]}{" "}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-gray-800">
                        {value} kcal
                      </Text>
                      <Text className="text-xs text-gray-400">{pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Meal list */}
      <View className="mx-4 mt-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Meals
        </Text>
        {dayMeals.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center">
            <Text className="text-3xl mb-2">🍽️</Text>
            <Text className="text-sm text-gray-400">
              No meals logged on this day.
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {dayMeals.map((meal) => (
              <MealRow key={meal.id} meal={meal} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MealRow({ meal }: { meal: Meal }) {
  return (
    <View className="bg-white rounded-xl p-4 flex-row items-center border border-gray-100">
      <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mr-3">
        <Text className="text-base">{MEAL_TYPE_EMOJI[meal.mealType]}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          {meal.foodName}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {new Date(meal.dateTime).toLocaleTimeString("en-NZ", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          · {meal.portionSize}g
        </Text>
      </View>
      <Text className="text-sm font-semibold text-gray-700">
        {meal.calories} kcal
      </Text>
    </View>
  );
}
