import './reanimatedLogger';

import { registerRootComponent } from 'expo';
import App from './App';
import notifee, { EventType } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { displayNotification } from './src/services/notificationService';


// Handle background messages silently and cleanly
setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
    await displayNotification(remoteMessage);
  });
  
  // Capture interaction context while application process runs in suspension
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
    //   console.log('Background click data intercept:', detail.notification?.data);
      console.log('Notification tapped in background!');
    }
  });
  
  registerRootComponent(App);