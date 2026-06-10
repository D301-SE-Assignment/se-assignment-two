import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Ethnicity,
  Gender,
  usePatientContext,
} from "../context/PatientContext";

const GENDERS: Gender[] = ["male", "female", "other"];
const ETHNICITIES: Ethnicity[] = [
  "NZ Maori",
  "NZ European",
  "Pacific Peoples",
  "Asian",
  "Other",
];

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPatientById, updatePatient, deletePatient } = usePatientContext();
  const router = useRouter();

  const patient = getPatientById(id);

  // ── All hooks must come before any conditional return ──────────────────────
  const [name, setName] = useState(patient?.name ?? "");
  const [age, setAge] = useState(String(patient?.age ?? ""));
  const [height, setHeight] = useState(String(patient?.height ?? ""));
  const [gender, setGender] = useState<Gender>(patient?.gender ?? "other");
  const [ethnicity, setEthnicity] = useState<Ethnicity>(
    patient?.ethnicity ?? "Other",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // ── Now safe to return early
  if (!patient) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Patient not found.</Text>
      </View>
    );
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      next.age = "Enter a valid age (1–120).";
    const heightNum = Number(height);
    if (!height || isNaN(heightNum) || heightNum < 50 || heightNum > 300)
      next.height = "Enter a valid height (50–300 cm).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await updatePatient(id, {
      name: name.trim(),
      age: Number(age),
      height: Number(height),
      gender,
      ethnicity,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    if (!patient) return;

    Alert.alert(
      "Delete Patient",
      `Remove ${patient.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePatient(id);
            router.replace("/(pages)/patients");
          },
        },
      ],
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-base">← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text className="text-red-400 text-base">Delete</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-1">
        Edit Profile
      </Text>
      <Text className="text-sm text-gray-400 mb-6">
        Created {new Date(patient.createdAt).toLocaleDateString("en-NZ")}
      </Text>

      {/* Name */}
      <Field label="Full Name" error={errors.name}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={name}
          onChangeText={setName}
        />
      </Field>

      {/* Age */}
      <Field label="Age" error={errors.age}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </Field>

      {/* Height */}
      <Field label="Height (cm)" error={errors.height}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </Field>

      {/* Gender */}
      <Field label="Gender" error={errors.gender}>
        <View className="flex-row gap-2">
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              className={`flex-1 py-3 rounded-lg border items-center ${
                gender === g ? "bg-blue-500 border-blue-500" : "border-gray-300"
              }`}
            >
              <Text
                className={
                  gender === g ? "text-white font-semibold" : "text-gray-600"
                }
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      {/* Ethnicity */}
      <Field label="Ethnicity" error={errors.ethnicity}>
        <View className="gap-2">
          {ETHNICITIES.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => setEthnicity(e)}
              className={`py-3 px-4 rounded-lg border ${
                ethnicity === e
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={
                  ethnicity === e ? "text-white font-semibold" : "text-gray-600"
                }
              >
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        className={`rounded-lg py-4 items-center mt-4 mb-10 ${
          saved ? "bg-green-500" : "bg-blue-500"
        }`}
      >
        <Text className="text-white text-lg font-bold">
          {saved ? "✓ Saved" : "Save Changes"}
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
