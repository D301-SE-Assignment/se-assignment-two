import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Ethnicity,
  Gender,
  usePatientContext,
} from "@/components/PatientContext";

const GENDERS: Gender[] = ["male", "female", "other"];
const ETHNICITIES: Ethnicity[] = [
  "NZ Maori",
  "NZ European",
  "Pacific Peoples",
  "Asian",
  "Other",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPatientById, updatePatient, deletePatient } = usePatientContext();
  const router = useRouter();

  const patient = getPatientById(id);

  // ── All hooks must come before any conditional return ──────────────────────
  const [name, setName] = useState(patient?.name ?? "");
  const [birthdate, setBirthdate] = useState(patient?.birthdate ?? "");
  const [height, setHeight] = useState(String(patient?.height ?? ""));
  const [gender, setGender] = useState<Gender>(patient?.gender ?? "other");
  const [ethnicity, setEthnicity] = useState<Ethnicity>(
    patient?.ethnicity ?? "Other",
  );
  const [dietaryRequirements, setDietaryRequirements] = useState(
    patient?.dietaryRequirements ?? "",
  );
  const [medicalConditions, setMedicalConditions] = useState(
    patient?.medicalConditions ?? "",
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

    if (!birthdate.trim()) {
      next.birthdate = "Birthdate is required.";
    } else if (!DATE_REGEX.test(birthdate.trim())) {
      next.birthdate = "Use the format YYYY-MM-DD.";
    } else {
      const parsed = new Date(birthdate.trim());
      if (isNaN(parsed.getTime()) || parsed > new Date()) {
        next.birthdate = "Enter a valid date in the past.";
      }
    }

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
      birthdate: birthdate.trim(),
      height: Number(height),
      gender,
      ethnicity,
      dietaryRequirements: dietaryRequirements.trim() || undefined,
      medicalConditions: medicalConditions.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    if (!patient) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Remove ${patient.name}? This cannot be undone.`,
      );
      if (confirmed) {
        deletePatient(id).then(() => {
          router.replace("/(pages)/patients");
        });
      }
    } else {
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
        Created {new Date(patient.createdAt).toLocaleDateString("en-NZ")} ·{" "}
        {patient.age} yrs old
      </Text>

      {/* Log Meal */}
      <TouchableOpacity
        onPress={() => router.push(`/(pages)/meals?patientId=${patient.id}`)}
        className="bg-green-500 rounded-lg py-3 items-center mb-3"
      >
        <Text className="text-white font-semibold">🍽️ Log Meal</Text>
      </TouchableOpacity>

      {/* Update Weight */}
      <TouchableOpacity
        onPress={() => router.push(`/(pages)/weight?patientId=${patient.id}`)}
        className="bg-blue-500 rounded-lg py-3 items-center mb-3"
      >
        <Text className="text-white font-semibold">⚖️ Update Weight</Text>
      </TouchableOpacity>

      {/* Daily Report */}
      <TouchableOpacity
        onPress={() => router.push(`/(pages)/report?patientId=${patient.id}`)}
        className="bg-amber-500 rounded-lg py-3 items-center mb-6"
      >
        <Text className="text-white font-semibold">📊 Daily Report</Text>
      </TouchableOpacity>

      {/* Name */}
      <Field label="Full Name" error={errors.name}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={name}
          onChangeText={setName}
        />
      </Field>

      {/* Birthdate */}
      <Field label="Birthdate" error={errors.birthdate}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={birthdate}
          onChangeText={setBirthdate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
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

      {/* Dietary Requirements */}
      <Field label="Dietary Requirements (optional)">
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={dietaryRequirements}
          onChangeText={setDietaryRequirements}
          placeholder="e.g. Vegetarian, gluten-free"
          multiline
        />
      </Field>

      {/* Medical Conditions */}
      <Field label="Medical Conditions (optional)">
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={medicalConditions}
          onChangeText={setMedicalConditions}
          placeholder="e.g. Type 2 diabetes"
          multiline
        />
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
