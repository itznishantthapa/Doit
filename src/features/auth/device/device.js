import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'secure_device_id';

export const getDeviceData = async () => {
  try {
    // 1. Fetch from SecureStore, fallback directly to OS native API calls
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY) || 
      (Platform.OS === 'android' ? Application.getAndroidId() : await Application.getIosIdForVendorAsync());

    // 2. If it wasn't in Secure Store, save it now
    if (deviceId && !(await SecureStore.getItemAsync(DEVICE_ID_KEY))) {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
    }

    return { deviceId, platform: Platform.OS };
  } catch (error) {
    console.error("Device data resolution fallback:", error);
    return { deviceId: 'fallback_error_id', platform: Platform.OS };
  }
};