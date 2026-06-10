import { useAuth } from "@/components/AuthProvider";
import { router } from "expo-router";

export default function Logout()
{
    const auth = useAuth()
    auth.logout()
    //router.replace('/login')
}