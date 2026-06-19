import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon, NotificationOff01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { TEXT_DARK } from '../../../constants/colors';
import HomeBanner from '../components/HomeBanner';
import ActionCard from '../components/ActionCard';
import ContactHelper from '../components/ContactHelper';
import RecentActivity from '../components/RecentActivity';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useBanners } from '../../../hooks/query/query/useBanner';
import { useSocials } from '../../../hooks/query/query/useSocial';
import { useUserNotification } from '../../../hooks/query/query/useUserNotification';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();


  const { data: banners = [], isBannersLoading } = useBanners();
  const { data: socials = [] } = useSocials();
  const { data: notifications = [] } = useUserNotification();



  // const hasUnread = useMemo(
  //   () => notifications.some((notification) => !notification.is_read),
  //   [notifications],
  // );

  const latestNotification = useMemo(() => notifications[0] ?? null, [notifications]);

  const handleRecentActivityPress = useCallback(() => {
    if (!latestNotification?.screen_name) return;
    navigation.navigate(latestNotification.screen_name, {
      assignmentId: latestNotification.assignment_id,
    });
  }, [navigation, latestNotification]);
  return (
    <MyWrapper style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {user?.username},</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
              hitSlop={8}
              onPress={() => navigation.navigate('Notification')}
            >
              <HugeiconsIcon
                icon={user?.is_notification_subscribed ? Notification01Icon : NotificationOff01Icon}
                size={24}
                color={TEXT_DARK}
                strokeWidth={1.5}
              />
              {/* {hasUnread ? <View style={styles.notificationDot} /> : null} */}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
              hitSlop={8}
              onPress={() => navigation.navigate('Setting')}
            >
              <HugeiconsIcon
                icon={Menu01Icon}
                size={24}
                color={TEXT_DARK}
                strokeWidth={1.5}
              />
            </Pressable>
          </View>
        </View>

        <HomeBanner data={banners} isLoading={isBannersLoading} />

        <ActionCard />

        <View style={styles.bottomContent}>
          <RecentActivity
            activity={
              latestNotification
                ? {
                    title: latestNotification.title,
                    description: latestNotification.description,
                    created_at: latestNotification.created_at,
                  }
                : null
            }
            onPress={handleRecentActivityPress}
          />

          <View style={styles.section}>
            <ContactHelper socials={socials} />
          </View>
        </View>
      </ScrollView>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 10,
  },
  greeting: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 18,
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
});

export default Home;
