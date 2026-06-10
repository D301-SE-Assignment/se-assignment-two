
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Ethnicity, Gender, usePatientContext as usePatient } from "@/components/PatientContext";
import { useRouter } from "expo-router";

const genderOptions: Gender[] = ["male", "female", "other"];

const heightOptions = Array.from({ length: 200 }, (_, i) => (i + 1).toString());

const ethnicityOptions: Ethnicity[] = [
  "NZ Maori",
  "NZ European",
  "Pacific Peoples",
  "Asian",
  "Other",
];

export default function CreatePatientScreen() {
  const { addPatient } = usePatient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);
  const [height, setHeight] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      return Alert.alert("Validation Error", "Name is required");
    }

    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      return Alert.alert("Validation Error", "Please enter a valid age");
    }

    if (!gender) {
      return Alert.alert("Validation Error", "Please select a gender");
    }

    if (!ethnicity) {
      return Alert.alert("Validation Error", "Please select an ethnicity");
    }

    if (height && (isNaN(Number(height)) || Number(height) <= 0 || Number(height) > 250)) {
      return Alert.alert("Validation Error", "Please enter a valid height");
    }

   addPatient({
        name: name,
        age: Number(age),
        gender: gender,
        ethnicity: ethnicity,
        height: 0, // Default height, can be updated later
     });

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Patient Profile</Text>

      {/* Name Input */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />

      {/* Age Input */}
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      {/* Gender Selection */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionRow}>
        {genderOptions.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, gender === g && styles.chipSelected]}
            onPress={() => setGender(gender ===g ? null : g)}
          >
            <Text
              style={[styles.chipText, gender === g && styles.chipTextSelected]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ethnicity Selection */}
      <Text style={styles.label}>Ethnicity</Text>
      <View style={styles.optionRow}>
        {ethnicityOptions.map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.chip, ethnicity === e && styles.chipSelected]}
            onPress={() => setEthnicity(ethnicity === e ? null : e)}
          >
            <Text
              style={[
                styles.chipText,
                ethnicity === e && styles.chipTextSelected,
              ]}
            >
              {e}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  chipSelected: {
    backgroundColor: "#007AFF",
  },

  chipText: {
    color: "#333",
  },

  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
