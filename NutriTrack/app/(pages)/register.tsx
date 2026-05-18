import { Platform, StyleSheet, View, ScrollView, Button, Text, TextInput, Pressable } from 'react-native';

function login()
{
  alert("Login")
}
function register()
{
  alert("Register")
}

export default function HomeScreen() {
  return (
    <View className="justify-center p-10 flex-1">
      <Text className="text-4xl font-bold self-center mb-4">Nutri-Track</Text>
      
      <Text className="text-xl">Email Address</Text>
      <TextInput className="border rounded-full p-2 mb-2" autoComplete='email' autoFocus keyboardType='email-address' returnKeyType='next' placeholder='example@example.com'></TextInput>
      
      <Text className="text-xl">Password</Text>
      <TextInput  className="border rounded-full p-2 mb-4" autoComplete='email' keyboardType='default' returnKeyType='next' placeholder='example@example.com'></TextInput>
      
      <Text className="text-xl">Confirm Password</Text>
      <TextInput  className="border rounded-full p-2 mb-4" autoComplete='email' keyboardType='default' returnKeyType='go' placeholder='example@example.com'></TextInput>
      
      <Pressable className="bg-blue-500 text-white self-center border rounded-full py-1 px-2 w-min" onPress={login}><Text>Login</Text></Pressable>
      <Pressable className="self-center" onPress={register}><Text>Already have an Account? <Text className="text-blue-500">Login</Text></Text></Pressable>
    </View>
  )
};