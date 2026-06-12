import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon } from '@hugeicons/core-free-icons';
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
          <Pressable
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
            hitSlop={8}
            onPress={() => navigation.navigate('Notification')}
          >
            <HugeiconsIcon
              icon={Notification01Icon}
              size={24}
              color={TEXT_DARK}
              strokeWidth={1.5}
            />
            {/* {hasUnread ? <View style={styles.notificationDot} /> : null} */}
          </Pressable>
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
    // marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 18,
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // notificationDot: {
  //   position: 'absolute',
  //   top: 8,
  //   right: 10,
  //   width: 10,
  //   height: 10,
  //   borderRadius: 4,
  //   backgroundColor: '#FF3B30',
  //   borderWidth: 1.5,
  //   borderColor: '#ffffff',
  // },
  pressed: {
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
});

export default Home;
