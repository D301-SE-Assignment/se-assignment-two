import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
import { useAuthContext } from "./context/AuthContext";

export default function ProfileScreen() {
  const { currentUser, logout } = useAuthContext();

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-14">
      <Text className="text-2xl font-bold text-gray-800 mb-1">Profile</Text>
      <Text className="text-sm text-gray-400 mb-6">{currentUser?.email}</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 rounded-lg py-3 items-center"
      >
        <Text className="text-white font-semibold">Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
