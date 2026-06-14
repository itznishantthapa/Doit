// src/services/notificationService.js
import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';

export const requestNotificationPermission = async () => {
  try {
    const messagingInstance = getMessaging(getApp());

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }

    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(messagingInstance);
      const hasPermission =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!hasPermission) return false;
    }

    if (Platform.OS === 'android') {
      await registerDeviceForRemoteMessages(messagingInstance);
    }

    return true;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    console.log('Getting FCM token');
    const token = await getToken(getMessaging(getApp()));
    console.log('FCM token:', token);
    return token;
  } catch (error) {
    console.error('FCM token error:', error);
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