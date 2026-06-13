// src/hooks/custom/useNotificationEngine.js
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { queryClient } from '../../services/queryClient';
import { USER_NOTIFICATIONS_QUERY_KEY } from '../query/query/useUserNotification';
import { 
  requestNotificationPermission, 
  getFCMToken, 
  setupNotificationChannel, 
  displayNotification 
} from '../../services/notificationService';

export function useNotificationEngine() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const activeUnsubscribers = [];

    const startNotificationPipeline = async () => {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission || !isMounted) return;

      await setupNotificationChannel();
      const token = await getFCMToken();

      if (token) {
        // Sync token then refresh user so notification icon state updates
        await useAuthStore.getState().syncPushToken(token);
      }

      // 1. Foreground FCM Listener
      activeUnsubscribers.push(
        messaging().onMessage(async (remoteMessage) => {
            console.log("⚡ Push notification received silently in foreground!");

            queryClient.invalidateQueries({ queryKey: USER_NOTIFICATIONS_QUERY_KEY });

            //only use this when you want to display a notification in the foreground
        //   await displayNotification(remoteMessage);
        })
      );

      // 2. Token Refresh Synchronization
      activeUnsubscribers.push(
        messaging().onTokenRefresh((newToken) => {
          useAuthStore.getState().syncPushToken(newToken);
        })
      );

      // 3. Foreground Notifee Tap Event Action Linker
      activeUnsubscribers.push(
        notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log('User tapped foreground notice:', detail.notification?.data);
            // Handle your App Navigation Service logic routing here cleanly
          }
        })
      );
    };

    startNotificationPipeline();

    return () => {
      isMounted = false;
      activeUnsubscribers.forEach((unsub) => unsub());
    };
  }, [accessToken]);
}