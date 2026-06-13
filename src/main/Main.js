import { NavigationContainer } from "@react-navigation/native";
import UserNavigator from "../navigation/user/UserNavigator";
import AuthNavigator from "../navigation/auth/AuthNavigator";
import { useEffect } from "react";
import { useFontsLoaded } from "../hooks/custom/useFontsLoaded";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import { useNotificationEngine } from "../hooks/custom/useNotificationEngine";

const Main = () => {
    // 1. Declare ALL hooks sequentially at the top
    const { user, initializeAuth } = useAuthStore();
    const isFontsLoaded = useFontsLoaded();

    // 🚀 Inject our reactive Notification engine hook. 
    // It self-activates automatically only when authorization checks resolve!
    useNotificationEngine();

    // Initialize Auth (Moved up here so it runs unconditionally on every render)
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]); // Good practice to include stable functions in dependency arrays

    // 2. Place conditional returns AFTER all hooks are registered
    if (!isFontsLoaded) {
        return null;
    }

    // Helper function to resolve layout based on Auth state
    function getContent() {
        if (user === undefined) {
            return null;  
        }

        if (!user) {
            return <AuthNavigator />;
        }

        return <UserNavigator />;
    }

    return (
        <NavigationContainer>
            {getContent()}
        </NavigationContainer>
    );
};

export default Main;