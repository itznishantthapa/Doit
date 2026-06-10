
import { NavigationContainer } from "@react-navigation/native"
import UserNavigator from "../navigation/user/UserNavigator"
import AuthNavigator from "../navigation/auth/AuthNavigator"
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react"
import { useFontsLoaded } from "../hooks/custom/useFontsLoaded";




const Main = () => {

    // Custom Hook to check if fonts are loaded
    const isFontsLoaded = useFontsLoaded();
 
  

    if (!isFontsLoaded) {
        console.log('Fonts are not loaded');
        return null;
    }

    return (
        <NavigationContainer>
            {false ? (<UserNavigator />) : (<AuthNavigator />)}
        </NavigationContainer>

    )
}

export default Main
