// src/services/notificationService.js
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';

export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }
    // iOS / Android fallback configuration request
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
};

export const setupNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;
  // Combine into a single high-priority fallback setup to radically reduce lines of code
  await notifee.createChannel({
    id: 'high_importance',
    name: 'Default High Importance Channel',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
};

export const displayNotification = async (remoteMessage) => {
  if (!remoteMessage?.data) return;
  const { title, body, bigImage, importance, ...restData } = remoteMessage.data;

  await notifee.displayNotification({
    title: title || 'New Update',
    body: body || '',
    data: remoteMessage.data,
    android: {
      channelId: 'high_importance',
      smallIcon: 'ic_notification', // Ensure this exists natively in android/app/src/main/res/drawable
      pressAction: { id: 'default' },
      style: bigImage 
        ? { type: AndroidStyle.BIGPICTURE, picture: bigImage } 
        : { type: AndroidStyle.BIGTEXT, text: body || '' },
    },
    ios: { foregroundPresentationOptions: { alert: true, badge: true, sound: true } },
  });
};