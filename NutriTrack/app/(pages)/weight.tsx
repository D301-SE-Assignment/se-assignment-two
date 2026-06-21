import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
import {
    WeightEntry,
    WeightUnit,
    useWeightContext,
} from "./context/WeightContext";

export default function WeightScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { getPatientById } = usePatientContext();
  const {
    getWeightEntriesByPatientId,
    addWeightEntry,
    deleteWeightEntry,
    loading,
  } = useWeightContext();

  const [mode, setMode] = useState<"list" | "add">("list");

  const patient = patientId ? getPatientById(patientId) : undefined;
  const entries = patientId ? getWeightEntriesByPatientId(patientId) : [];

  const latestEntry = entries[0];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!patientId || !patient) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-4xl mb-4">⚖️</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No patient selected
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Open a patient profile and tap "Update Weight" to start tracking.
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

  function confirmDeleteEntry(id: string, label: string) {
    const message = `Remove the ${label} entry? This cannot be undone.`;
    if (Platform.OS === "web") {
      if (window.confirm(message)) deleteWeightEntry(id);
    } else {
      Alert.alert("Delete Entry", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWeightEntry(id),
        },
      ]);
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-500 text-sm">
            ← Back to {patient.name}
          </Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">
          Weight Tracking
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {patient.name}
          {latestEntry
            ? ` · Latest: ${latestEntry.weight} ${latestEntry.unit}`
            : " · No entries yet"}
        </Text>
      </View>

      {/* Tab toggle */}
      <View className="flex-row bg-white border-b border-gray-100 px-4">
        <TabButton
          label="History"
          active={mode === "list"}
          onPress={() => setMode("list")}
        />
        <TabButton
          label="Add Entry"
          active={mode === "add"}
          onPress={() => setMode("add")}
        />
      </View>

      {mode === "list" ? (
        <WeightListView
          entries={entries}
          onDelete={confirmDeleteEntry}
          onAddPress={() => setMode("add")}
        />
      ) : (
        <AddWeightForm
          patientId={patientId}
          onSaved={() => setMode("list")}
          addWeightEntry={addWeightEntry}
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
        active ? "border-blue-500" : "border-transparent"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── List view ────────────────────────────────────────────────────────────────

function WeightListView({
  entries,
  onDelete,
  onAddPress,
}: {
  entries: WeightEntry[];
  onDelete: (id: string, label: string) => void;
  onAddPress: () => void;
}) {
  if (entries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-4">⚖️</Text>
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          No weight entries yet
        </Text>
        <Text className="text-sm text-gray-400 text-center mb-6">
          Start tracking this patient's body weight over time.
        </Text>
        <TouchableOpacity
          onPress={onAddPress}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Log First Entry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {entries.map((entry) => (
        <View
          key={entry.id}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-gray-100"
        >
          <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-3">
            <Text className="text-lg">⚖️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">
              {entry.weight} {entry.unit}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {new Date(entry.dateTime).toLocaleString("en-NZ", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onDelete(entry.id, `${entry.weight} ${entry.unit}`)}
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

// ── Add weight form ──────────────────────────────────────────────────────────

function AddWeightForm({
  patientId,
  onSaved,
  addWeightEntry,
}: {
  patientId: string;
  onSaved: () => void;
  addWeightEntry: (entry: {
    patientId: string;
    weight: number;
    unit: WeightUnit;
    dateTime: string;
  }) => Promise<void>;
}) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const weightNum = Number(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0)
      next.weight = "Enter a valid weight.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addWeightEntry({
        patientId,
        weight: Number(weight),
        unit,
        dateTime: new Date().toISOString(),
      });
      onSaved();
      setWeight("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 px-6 pt-5"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Field label="Weight" error={errors.weight}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="e.g. 70"
        />
      </Field>

      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-600 mb-1">Unit</Text>
        <View className="flex-row gap-2">
          {(["kg", "lbs"] as WeightUnit[]).map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => setUnit(u)}
              className={`flex-1 py-3 rounded-lg border items-center ${
                unit === u ? "bg-blue-500 border-blue-500" : "border-gray-300"
              }`}
            >
              <Text
                className={
                  unit === u ? "text-white font-semibold" : "text-gray-600"
                }
              >
                {u === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={saving}
        className="bg-blue-500 rounded-lg py-4 items-center mb-10"
      >
        <Text className="text-white text-lg font-bold">
          {saving ? "Saving..." : "Log Weight"}
        </Text>
      </TouchableOpacity>
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
