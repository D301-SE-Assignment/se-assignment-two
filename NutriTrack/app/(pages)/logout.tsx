import { router } from "expo-router";
import { useAuthContext } from "./context/AuthContext";
import { Alert } from "react-native";

export default function Logout()
{
    const { logout } = useAuthContext();
    
    function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => logout() },
    ]);
    }
    
    handleLogout();
}