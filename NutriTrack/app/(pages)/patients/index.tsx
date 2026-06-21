import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Patient, usePatientContext } from "../context/PatientContext";

export default function PatientListScreen() {
  const { patients, deletePatient, loading } = usePatientContext();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete Patient", `Remove ${name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePatient(id),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Patients</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {patients.length} {patients.length === 1 ? "profile" : "profiles"}
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
            Add your first patient profile to start tracking dietary data.
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
            <PatientCard
              patient={item}
              onPress={() => router.push(`./(pages)/patients/${item.id}`)}
              onDelete={() => confirmDelete(item.id, item.name)}
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

function PatientCard({
  patient,
  onPress,
  onDelete,
}: {
  patient: Patient;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100">
      {/* Tappable area — avatar + info only */}
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center flex-1"
        activeOpacity={0.7}
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
      </TouchableOpacity>

      {/* Delete button — sibling, not nested */}
      <TouchableOpacity
        onPress={() => {
          console.log("TRASH TAPPED", patient.id);
          onDelete();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="ml-2 p-2"
      >
        <Text className="text-red-400 text-lg">🗑</Text>
      </TouchableOpacity>
    </View>
  );
}
