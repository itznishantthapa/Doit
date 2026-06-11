import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon } from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { TEXT_DARK } from '../../../constants/colors';
import HomeBanner from '../components/HomeBanner';
import ActionCard from '../components/ActionCard';
import ContactHelper from '../components/ContactHelper';
import {
  HELPER_CONTACTS,
  MOCK_USER,
} from '../data/mockHomeData';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useBanners } from '../../../hooks/query/query/useBanner';

const Home = () => {
  const { user } = useAuthStore();
  const { data: banners = [], isLoading } = useBanners();

  useEffect(() => {
    console.log('user', user);
    console.log('banners', banners);
  }, [user, banners]);
  
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

        <HomeBanner data={banners} isLoading={isLoading} />

        <ActionCard />

        <View style={styles.section}>
          <ContactHelper contacts={HELPER_CONTACTS} />
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
    paddingBottom: 32,
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
