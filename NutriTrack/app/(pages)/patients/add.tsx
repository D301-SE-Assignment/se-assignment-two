import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
} from "../context/PatientContext";

const GENDERS: Gender[] = ["male", "female", "other"];
const ETHNICITIES: Ethnicity[] = [
  "NZ Maori",
  "NZ European",
  "Pacific Peoples",
  "Asian",
  "Other",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function AddPatientScreen() {
  const router = useRouter();
  const { addPatient } = usePatientContext();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Gender>("other");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("Other");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addPatient({
        name: name.trim(),
        birthdate: birthdate.trim(),
        height: Number(height),
        gender,
        ethnicity,
        dietaryRequirements: dietaryRequirements.trim() || undefined,
        medicalConditions: medicalConditions.trim() || undefined,
      });
      router.replace("/(pages)/patients");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-base">← Back</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-1">Add Patient</Text>
      <Text className="text-sm text-gray-400 mb-6">
        Create a new patient profile to start tracking dietary data.
      </Text>

      {/* Name */}
      <Field label="Full Name" error={errors.name}>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Jane Smith"
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
          placeholder="e.g. 170"
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
        onPress={handleSubmit}
        disabled={saving}
        className="bg-blue-500 rounded-lg py-4 items-center mt-4 mb-10"
      >
        <Text className="text-white text-lg font-bold">
          {saving ? "Saving..." : "Add Patient"}
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
