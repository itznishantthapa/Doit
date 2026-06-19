import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoaderKitView from 'react-native-loader-kit';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Delete02Icon,
  File02Icon,
  Logout01Icon,
  SecurityLockIcon,
} from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import { TEXT_DARK, WHITE } from '../../../constants/colors';
import { POLICY_URL, TERMS_URL } from '../../../constants/legalUrls';
import { useAuthStore } from '../../auth/store/useAuthStore';

const SHADE = '#F7F7F7';
const SHADE_LIGHT = '#FAFAFA';
const SHADE_BORDER = '#EEEEEE';
const TEXT_SECONDARY = 'rgba(26, 26, 26, 0.45)';

const formatMemberSince = (createdAt) => {
  if (!createdAt) return 'Unknown';

  return new Date(createdAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const SettingRow = ({ label, icon, onPress, isLast = false }) => (
  <Pressable
    style={({ pressed }) => [styles.settingRow, pressed && styles.pressed, isLast && styles.settingRowLast]}
    onPress={onPress}
  >
    <View style={styles.settingRowIcon}>
      <HugeiconsIcon icon={icon} size={20} color={TEXT_DARK} strokeWidth={1.5} />
    </View>
    <Text style={styles.settingRowLabel}>{label}</Text>
    <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={TEXT_SECONDARY} strokeWidth={1.5} />
  </Pressable>
);

const Setting = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const memberSince = useMemo(
    () => formatMemberSince(user?.created_at),
    [user?.created_at],
  );

  const avatarInitial = useMemo(() => {
    const initial = user?.username?.trim()?.charAt(0);
    return initial ? initial.toUpperCase() : '?';
  }, [user?.username]);

  const handleTermsOfService = useCallback(() => {
    navigation.navigate('LegalWebView', {
      title: 'Terms of Service',
      url: TERMS_URL,
    });
  }, [navigation]);

  const handlePrivacyPolicy = useCallback(() => {
    navigation.navigate('LegalWebView', {
      title: 'Privacy Policy',
      url: POLICY_URL,
    });
  }, [navigation]);

  const handleAccountDeletion = useCallback(() => {
    navigation.navigate('Delete');
  }, [navigation]);

  const handleSignOutPress = useCallback(() => {
    if (isSigningOut) return;

    Alert.alert(
      '',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Sign out cancelled'),
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            console.log('Sign out confirmed');
            setIsSigningOut(true);

            try {
              await logout();
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [isSigningOut, logout]);

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.username}>{user?.username ?? 'User'}</Text>
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>


        <View style={styles.menuGroup}>
          <SettingRow
            label="Terms of Service"
            icon={File02Icon}
            onPress={handleTermsOfService}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Privacy Policy"
            icon={SecurityLockIcon}
            onPress={handlePrivacyPolicy}
            isLast
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuGroup}>
          <SettingRow
            label="Account Deletion"
            icon={Delete02Icon}
            onPress={handleAccountDeletion}
            isLast
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && !isSigningOut && styles.pressed,
          ]}
          onPress={handleSignOutPress}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <LoaderKitView
              style={styles.signOutLoader}
              name="BallPulse"
              animationSpeedMultiplier={1.0}
              color={TEXT_DARK}
            />
          ) : (
            <>
              <HugeiconsIcon icon={Logout01Icon} size={20} color={TEXT_DARK} strokeWidth={1.5} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </MyWrapper>
  );
};

export default Setting;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: WHITE,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: SHADE_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginTop: 8,
    marginBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SHADE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 28,
    color: TEXT_DARK,
  },
  username: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 20,
    color: TEXT_DARK,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  memberSince: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  sectionLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  menuGroup: {
    backgroundColor: SHADE_LIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  settingRowLast: {},
  settingRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SHADE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRowLabel: {
    flex: 1,
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SHADE_BORDER,
    marginLeft: 64,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: SHADE_LIGHT,
    borderRadius: 16,
    height: 52,
  },
  signOutLoader: {
    width: 24,
    height: 24,
  },
  signOutText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.7,
  },
});
