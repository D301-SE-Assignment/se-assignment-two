import { useAuthContext } from "@/app/(pages)/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuthContext();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (
          Platform.OS === "web" &&
          document.activeElement instanceof HTMLElement
        ) {
          document.activeElement.blur();
        }
        router.replace("/");
      } else {
        Alert.alert(
          "Login Failed",
          result.message ?? "Invalid email or password.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function goToRegister() {
    router.replace("/RegisterScreen");
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
        returnKeyType="go"
        placeholder="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        className="bg-blue-500 text-white self-center border rounded-full py-1 px-2 w-min"
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text>{submitting ? "Logging in..." : "Login"}</Text>
      </Pressable>
      <Pressable className="self-center" onPress={goToRegister}>
        <Text>
          Don't have an Account? <Text className="text-blue-500">Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}
