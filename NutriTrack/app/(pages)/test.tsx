import { ScrollView, Text } from "react-native";

export default function TestScreen() {
  return (
    <ScrollView className="flex-1 bg-white px-6 pt-14">
      <Text className="text-2xl font-bold mb-4">Test Screen</Text>
      <Text className="text-gray-500">
        Use this screen for trying things out during development.
      </Text>
    </ScrollView>
  );
}
