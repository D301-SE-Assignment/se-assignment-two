import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Patient, usePatientContext } from "./context/PatientContext";

export default function SwitchProfileScreen() {
  const { patients, loading } = usePatientContext();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  function goToDashboard(patient: Patient) {
    router.push(`/(pages)?patientId=${patient.id}`);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Switch Profile</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Choose a patient to view their dashboard
        </Text>
      </View>

      {/* Empty state */}
      {patients.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">👤</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            No patients yet
          </Text>
          <Text className="text-sm text-gray-400 text-center mb-6">
            Add a patient profile to start tracking dietary data.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(pages)/patients/add")}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Add Patient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(p) => p.id}
          contentContainerClassName="px-4 pt-4 pb-24"
          renderItem={({ item }) => (
            <SwitchProfileCard
              patient={item}
              onPress={() => goToDashboard(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      {patients.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/(pages)/patients/add")}
          className="absolute bottom-8 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SwitchProfileCard({
  patient,
  onPress,
}: {
  patient: Patient;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
    >
      <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
        <Text className="text-xl">
          {patient.gender === "female"
            ? "👩"
            : patient.gender === "male"
              ? "👨"
              : "🧑"}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {patient.name}
        </Text>
        <Text className="text-sm text-gray-500">
          {patient.age} yrs · {patient.height} cm · {patient.ethnicity}
        </Text>
      </View>
      <Text className="text-blue-400 text-lg">→</Text>
    </TouchableOpacity>
  );
}
