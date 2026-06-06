import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/hook/useAuth';




const PRIMARY = '#729ef1';
const PRIMARY_DARK = '#5a85e0';
const TEXT_DARK = '#1a1a1a';
const TEXT_MUTED = '#8e8e8e';
const CHAT_FOOTER_HEIGHT = 120;

const ScheduleCard = ({ item }) => {
  const isDark = item.dark;
  const isTall = item.variant === 'tall';

  return (
    <Pressable
      style={[
        styles.scheduleCard,
        isTall ? styles.scheduleCardTall : styles.scheduleCardCompact,
        item.image && !isTall && styles.scheduleCardCompactWithImage,
        { backgroundColor: item.backgroundColor },
        isDark && styles.scheduleCardDark,
        isDark && item.image && styles.scheduleCardDarkWithImage,
      ]}
      onPress={item.onPress}
    >
      <Text style={[styles.scheduleTitle, isDark && styles.scheduleTitleDark]}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text
          style={[
            styles.scheduleSubtitle,
            isDark ? styles.scheduleSubtitleDark : styles.scheduleSubtitleLight,
          ]}
        >
          {item.subtitle}
        </Text>
      ) : null}
      {item.image ? (
        <View style={styles.illustrationBox}>
          <Image source={item.image} style={styles.illustrationImage} resizeMode="contain" />
        </View>
      ) : null}
    </Pressable>
  );
};

const Home = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {logout} = useAuth();

  const scheduleLeft = [
    {
      key: '1',
      title: 'Assignment Help',
      subtitle: 'Provide us your assignment',
      variant: 'compact',
      backgroundColor: PRIMARY,
      dark: true,
      image: require('../../../assets/upload.png'),
      onPress: () => navigation.navigate('Upload'),
    },
    {
      key: '3',
      title: 'Completed ( + 1 )',
      subtitle: 'View and download your completed assignments.',
      variant: 'tall',
      backgroundColor: '#ffffff',
      image: require('../../../assets/completed.png'),
      onPress: () => navigation.navigate('Completed'),
    },
  ];

  const scheduleRight = [
    {
      key: '2',
      title: 'Pending ( + 2 )',
      subtitle: 'Track your assignments.',
      variant: 'tall',
      backgroundColor: '#ffffff',
      image: require('../../../assets/track.png'),
      onPress: () => navigation.navigate('Pending'),
    },
    {
      key: '4',
      title: 'My All ( + 6 )',
      subtitle: 'View all of your given assignments.',
      variant: 'compact',
      backgroundColor: PRIMARY,
      dark: true,
      image: require('../../../assets/alllist.png'),
      onPress: () => navigation.navigate('All'),
    },
  ];

  return (
    <MyWrapper
      enableTopInset={false}
      enableBottomInset={false}
      style={styles.screen}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + CHAT_FOOTER_HEIGHT + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              Hi, <Text style={styles.greetingName}>Nishant</Text>
            </Text>
            <Text style={styles.subheadline}>
              Let&apos;s do not miss any {' '}
              <Text style={styles.headlineAccent}>Assignment</Text>
            </Text>
          </View>
          <Pressable style={styles.notificationButton} onPress={logout}>
            <Ionicons name="notifications-outline" size={22} color={PRIMARY_DARK} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroText}>
          Please let us know how we can help you.
          </Text>
          <Pressable style={styles.viewTaskButton}>
            <Text style={styles.viewTaskText}>View Sample Assignment</Text>
          </Pressable>
        </View>

        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Assignments & Actions</Text>

          <View style={styles.scheduleGrid}>
            <View style={styles.scheduleColumn}>
              {scheduleLeft.map((item) => (
                <ScheduleCard key={item.key} item={item} />
              ))}
            </View>
            <View style={styles.scheduleColumn}>
              {scheduleRight.map((item) => (
                <ScheduleCard key={item.key} item={item} />
              ))}
            </View>
          </View>

          <Pressable style={styles.scheduleFiller}>
            <View style={styles.scheduleFillerContent}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={28}
                color={PRIMARY}
              />
              <View style={styles.scheduleFillerText}>
                <Text style={styles.scheduleFillerTitle}>No more tasks for today</Text>
                <Text style={styles.scheduleFillerSubtitle}>
                  You&apos;re all caught up. Chat with a helper anytime using the button below.
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.chatFooter, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.chatBubbleWrapper}>
          <Pressable style={styles.chatBubbleButton} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#ffffff" />
            <Text style={styles.chatBubbleText}>Chat with Helper</Text>
          </Pressable>
          <View style={styles.chatBubbleTail} />
        </View>
      </View>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '400',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  greetingName: {
    fontWeight: '700',
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_MUTED,
    lineHeight: 22,
  },

  headlineAccent: {
    color: PRIMARY,
    fontWeight: '600',
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f6fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 28,
  },
  heroText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 22,
  },
  viewTaskButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewTaskText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  scheduleSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  scheduleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleFiller: {
    flex: 1,
    minHeight: 140,
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: '#f3f6fd',
    padding: 20,
    justifyContent: 'center',
  },
  scheduleFillerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scheduleFillerText: {
    flex: 1,
    gap: 4,
  },
  scheduleFillerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  scheduleFillerSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  scheduleColumn: {
    flex: 1,
    gap: 12,
  },
  scheduleCard: {
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleCardCompact: {
    minHeight: 96,
  },
  scheduleCardCompactWithImage: {
    minHeight: 200,
  },
  scheduleCardTall: {
    minHeight: 200,
  },
  scheduleCardDark: {
    justifyContent: 'center',
  },
  scheduleCardDarkWithImage: {
    justifyContent: 'flex-start',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    lineHeight: 20,
  },
  scheduleTitleDark: {
    color: '#ffffff',
  },
  scheduleSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  scheduleSubtitleDark: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  scheduleSubtitleLight: {
    color: TEXT_MUTED,
  },
  illustrationBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  illustrationImage: {
    width: 100,
    height: 80,
  },
  chatFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 44,
    backgroundColor: '#ffffff',
    overflow: 'visible',
  },
  chatBubbleWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  chatBubbleButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  chatBubbleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  chatBubbleTail: {
    position: 'absolute',
    left: 2,
    top: -35,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 30,
    borderBottomWidth: 42,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: PRIMARY,
  },
});

export default Home;
