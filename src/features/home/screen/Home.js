import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon } from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { TEXT_DARK } from '../../../constants/colors';
import HomeBanner from '../components/HomeBanner';
import ActionCard from '../components/ActionCard';
import ContactHelper from '../components/ContactHelper';
import RecentActivity from '../components/RecentActivity';
import {
  MOCK_RECENT_ACTIVITY,
  MOCK_USER,
} from '../data/mockHomeData';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useBanners } from '../../../hooks/query/query/useBanner';
import { useSocials } from '../../../hooks/query/query/useSocial';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const { user } = useAuthStore();
  const { data: banners = [], isBannersLoading } = useBanners();
  const { data: socials = [] } = useSocials();


  useEffect(() => {
    const checkAccessToken = async () => {
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
    console.log('refreshToken', refreshToken);
 
    };
    checkAccessToken();
  }, []);

  
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
          >
            <HugeiconsIcon
              icon={Notification01Icon}
              size={24}
              color={TEXT_DARK}
              strokeWidth={1.5}
            />
            {MOCK_USER.hasNotification ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        </View>

        <HomeBanner data={banners} isLoading={isBannersLoading} />

        <ActionCard />

        <View style={styles.bottomContent}>
          <RecentActivity
            activity={MOCK_RECENT_ACTIVITY}
            onPress={() => {
              if (__DEV__) console.log('Recent activity pressed');
            }}
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
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#ffffff',
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
