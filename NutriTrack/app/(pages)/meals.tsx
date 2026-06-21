import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePatientContext } from "./context/PatientContext";
import { Meal, MealType, useMealContext } from "./context/MealContext";
import { FoodSearchResult, useFoodSearch } from "./hooks/useFoodSearch";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: "🥣",
  lunch: "🥪",
  dinner: "🍽️",
  snack: "🍎",
};

export default function MealsScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { getPatientById } = usePatientContext();
  const { getMealsByPatientId, addMeal, deleteMeal, loading } = useMealContext();

  const [mode, setMode] = useState<"list" | "add">("list");

  const patient = patientId ? getPatientById(patientId) : undefined;
  const meals = patientId ? getMealsByPatientId(patientId) : [];

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return meals
      .filter((m) => new Date(m.dateTime).toDateString() === today)
      .reduce((sum, m) => sum + m.calories, 0);
  }, [meals]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!patientId || !patient) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-4xl mb-4">🍽️</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No patient selected
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Open a patient profile and tap "Log Meal" to start tracking their
          food intake.
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

  function confirmDeleteMeal(id: string, name: string) {
    const message = `Remove "${name}" from the log? This cannot be undone.`;
    if (Platform.OS === "web") {
      if (window.confirm(message)) deleteMeal(id);
    } else {
      Alert.alert("Delete Meal", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMeal(id) },
      ]);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-500 text-sm">← Back to {patient.name}</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Meal Log</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {patient.name} · {todayTotal} kcal logged today
        </Text>
      </View>

      {/* Tab toggle */}
      <View className="flex-row bg-white border-b border-gray-100 px-4">
        <TabButton
          label="Meals"
          active={mode === "list"}
          onPress={() => setMode("list")}
        />
        <TabButton
          label="Add Meal"
          active={mode === "add"}
          onPress={() => setMode("add")}
        />
      </View>

      {mode === "list" ? (
        <MealListView
          meals={meals}
          onDelete={confirmDeleteMeal}
          onAddPress={() => setMode("add")}
        />
      ) : (
        <AddMealForm
          patientId={patientId}
          onSaved={() => setMode("list")}
          addMeal={addMeal}
        />
      )}
    </View>
  );
}

// ── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-3 mr-2 border-b-2 ${
        active ? "border-green-500" : "border-transparent"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? "text-green-600" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── List view ────────────────────────────────────────────────────────────────

function MealListView({
  meals,
  onDelete,
  onAddPress,
}: {
  meals: Meal[];
  onDelete: (id: string, name: string) => void;
  onAddPress: () => void;
}) {
  if (meals.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-4">🍽️</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No meals logged yet
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Start tracking this patient's dietary intake.
        </Text>
        <TouchableOpacity
          onPress={onAddPress}
          className="bg-green-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Log First Meal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
      {meals.map((meal) => (
        <View
          key={meal.id}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-gray-100"
        >
          <View className="w-11 h-11 rounded-full bg-green-50 items-center justify-center mr-3">
            <Text className="text-lg">{MEAL_TYPE_EMOJI[meal.mealType]}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">
              {meal.foodName}
            </Text>
            <Text className="text-sm text-gray-500">
              {meal.calories} kcal · {meal.portionSize} g ·{" "}
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {new Date(meal.dateTime).toLocaleString("en-NZ", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onDelete(meal.id, meal.foodName)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-2"
          >
            <Text className="text-red-400 text-lg">🗑</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Add meal form ────────────────────────────────────────────────────────────

function AddMealForm({
  patientId,
  onSaved,
  addMeal,
}: {
  patientId: string;
  onSaved: () => void;
  addMeal: (meal: {
    patientId: string;
    foodName: string;
    calories: number;
    portionSize: number;
    mealType: MealType;
    dateTime: string;
  }) => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const [foodName, setFoodName] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState(""); // used for both search + manual
  const [portionSize, setPortionSize] = useState("100");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { results, searching, error: searchError } = useFoodSearch(
    manualMode ? "" : searchQuery,
  );

  const computedCalories = useMemo(() => {
    const cal100 = Number(caloriesPer100g);
    const portion = Number(portionSize);
    if (isNaN(cal100) || isNaN(portion)) return 0;
    return Math.round((cal100 / 100) * portion);
  }, [caloriesPer100g, portionSize]);

  function selectFood(food: FoodSearchResult) {
    setSelectedFood(food);
    setFoodName(food.name);
    if (food.caloriesPer100g != null) {
      setCaloriesPer100g(String(food.caloriesPer100g));
      setManualMode(false);
    } else {
      // No energy data from the API — fall back to manual entry for calories
      setCaloriesPer100g("");
      setManualMode(true);
    }
    setSearchQuery("");
  }

  function switchToManualEntry() {
    setSelectedFood(null);
    setManualMode(true);
    setFoodName("");
    setCaloriesPer100g("");
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!foodName.trim()) next.foodName = "Food name is required.";
    const cal100 = Number(caloriesPer100g);
    if (!caloriesPer100g || isNaN(cal100) || cal100 < 0)
      next.caloriesPer100g = "Enter valid calories per 100g.";
    const portion = Number(portionSize);
    if (!portionSize || isNaN(portion) || portion <= 0)
      next.portionSize = "Enter a valid portion size in grams.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addMeal({
        patientId,
        foodName: foodName.trim(),
        calories: computedCalories,
        portionSize: Number(portionSize),
        mealType,
        dateTime: new Date().toISOString(),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 px-6 pt-5" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Food selection */}
      {!manualMode && !selectedFood && (
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-600 mb-1">
            Search Food Database
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="e.g. banana, chicken breast..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searching && (
            <View className="flex-row items-center gap-2 mt-3">
              <ActivityIndicator size="small" color="#22c55e" />
              <Text className="text-sm text-gray-400">Searching...</Text>
            </View>
          )}

          {searchError && (
            <Text className="text-red-500 text-xs mt-2">{searchError}</Text>
          )}

          {!searching && results.length > 0 && (
            <View className="mt-3 gap-2">
              {results.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => selectFood(food)}
                  className="border border-gray-200 rounded-lg px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-gray-800">
                    {food.name}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {food.brand ? `${food.brand} · ` : ""}
                    {food.caloriesPer100g != null
                      ? `${food.caloriesPer100g} kcal / 100g`
                      : "No calorie data — manual entry needed"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!searching &&
            searchQuery.trim().length >= 2 &&
            results.length === 0 &&
            !searchError && (
              <Text className="text-sm text-gray-400 mt-3">
                No matches found.
              </Text>
            )}

          <TouchableOpacity onPress={switchToManualEntry} className="mt-4">
            <Text className="text-sm text-blue-500 font-medium">
              Can't find it? Add manually instead
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected food / manual entry form */}
      {(selectedFood || manualMode) && (
        <>
          {selectedFood && (
            <TouchableOpacity
              onPress={() => {
                setSelectedFood(null);
                setManualMode(false);
                setFoodName("");
                setCaloriesPer100g("");
              }}
              className="mb-4"
            >
              <Text className="text-sm text-blue-500">← Choose a different food</Text>
            </TouchableOpacity>
          )}

          {manualMode && !selectedFood && (
            <TouchableOpacity onPress={() => setManualMode(false)} className="mb-4">
              <Text className="text-sm text-blue-500">← Back to search</Text>
            </TouchableOpacity>
          )}

          <Field label="Food Name" error={errors.foodName}>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              value={foodName}
              onChangeText={setFoodName}
              editable={manualMode || !selectedFood}
            />
          </Field>

          <Field label="Calories per 100g" error={errors.caloriesPer100g}>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              value={caloriesPer100g}
              onChangeText={setCaloriesPer100g}
              keyboardType="numeric"
              placeholder="e.g. 89"
            />
          </Field>

          <Field label="Portion Size (g)" error={errors.portionSize}>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              value={portionSize}
              onChangeText={setPortionSize}
              keyboardType="numeric"
            />
          </Field>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-600 mb-1">
              Meal Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setMealType(type)}
                  className={`px-4 py-2 rounded-lg border ${
                    mealType === type
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      mealType === type
                        ? "text-white font-semibold"
                        : "text-gray-600"
                    }
                  >
                    {MEAL_TYPE_EMOJI[type]}{" "}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Computed calories preview */}
          {caloriesPer100g && portionSize && (
            <View className="bg-green-50 rounded-lg px-4 py-3 mb-5">
              <Text className="text-sm text-green-700">
                Total: <Text className="font-bold">{computedCalories} kcal</Text>{" "}
                for {portionSize}g
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="bg-green-500 rounded-lg py-4 items-center mb-10"
          >
            <Text className="text-white text-lg font-bold">
              {saving ? "Saving..." : "Log Meal"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-gray-600 mb-1">{label}</Text>
      {children}
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}