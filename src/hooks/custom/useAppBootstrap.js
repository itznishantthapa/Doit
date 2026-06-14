import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { checkIfUpdateRequired } from '../../services/versionService';

export function useAppBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);

  const [fontsLoaded, fontError] = Font.useFonts({
    'Jakarta-Regular': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'Jakarta-SemiBold': require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'Jakarta-Bold': require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return undefined;

    let cancelled = false;

    (async () => {
      const needsUpdate = await checkIfUpdateRequired();

      if (cancelled) return;

      setUpdateRequired(needsUpdate);
      setIsReady(true);
      await SplashScreen.hideAsync();
    })();

    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, fontError]);

  return { isReady, updateRequired };
}
