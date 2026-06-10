import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "./src/services/queryClient";
import Main from "./src/main/Main";
import { useEffect } from "react";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as SplashScreen from 'expo-splash-screen';


SplashScreen.preventAutoHideAsync();


const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});



export default function App() {


  useEffect(() => {
    SystemNavigationBar.setFitsSystemWindows(false);
    SystemNavigationBar.setNavigationColor('#00000000', 'dark', 'navigation');
    SystemNavigationBar.setNavigationBarContrastEnforced(false);
  }, []);

  return (
    <GestureHandlerRootView>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
        }}
      >
        <SafeAreaProvider>
          <KeyboardProvider>

              <Main />

          </KeyboardProvider>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
