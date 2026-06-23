import { useAuthContext } from "@/app/(pages)/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuthContext();

  function goToLogin() {
    router.replace("/LoginScreen");
  }

  async function handleRegister() {
    if (!email || !password || !password2) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== password2) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(email, password);
      if (result.success) {
        Alert.alert("Success", "Account created! You can now log in.");
        router.replace("/LoginScreen");
      } else {
        Alert.alert(
          "Registration Failed",
          result.message ?? "Something went wrong.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="justify-center p-10 flex-1">
      <Text className="text-4xl font-bold self-center mb-4">Nutri-Track</Text>

      <Text className="text-xl">Email Address</Text>
      <TextInput
        className="border rounded-full p-2 mb-2"
        autoComplete="email"
        autoFocus
        keyboardType="email-address"
        returnKeyType="next"
        placeholder="example@example.com"
        value={email}
        onChangeText={setEmail}
      />

      <Text className="text-xl">Password</Text>
      <TextInput
        className="border rounded-full p-2 mb-4"
        keyboardType="default"
        returnKeyType="next"
        placeholder="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text className="text-xl">Confirm Password</Text>
      <TextInput
        className="border rounded-full p-2 mb-4"
        keyboardType="default"
        returnKeyType="go"
        placeholder="password"
        secureTextEntry
        value={password2}
        onChangeText={setPassword2}
      />

      <Pressable
        className="bg-blue-500 text-white self-center border rounded-full py-1 px-2 w-min"
        onPress={handleRegister}
        disabled={submitting}
      >
        <Text>{submitting ? "Registering..." : "Register"}</Text>
      </Pressable>
      <Pressable className="self-center" onPress={goToLogin}>
        <Text>
          Already have an Account? <Text className="text-blue-500">Login</Text>
        </Text>
      </Pressable>
    </View>
  );
}
