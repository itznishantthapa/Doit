// src/hooks/useFontsLoaded.js
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export function useFontsLoaded() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded, fontError] = Font.useFonts({
    'Jakarta-Regular': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'Jakarta-SemiBold': require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'Jakarta-Bold': require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {

    async function handleSplashAndFonts() {
      if (fontsLoaded || fontError) {

 
          SplashScreen.hideAsync();
   

        setIsReady(true);
      }


    }

    handleSplashAndFonts();
  }, [fontsLoaded, fontError]);

  return isReady;
}