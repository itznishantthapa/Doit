import React, { useCallback, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TiktokIcon,
  ViberIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { SOFTGREY, TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';

const MAX_SOCIALS = 5;

const SOCIAL_PRIORITY = ['whatsapp', 'viber', 'instagram', 'tiktok', 'facebook', 'telegram'];

const SOCIAL_ICONS = {
  whatsapp: WhatsappIcon,
  instagram: InstagramIcon,
  telegram: TelegramIcon,
  facebook: FacebookIcon,
  viber: ViberIcon,
  tiktok: TiktokIcon,
};

const SOCIAL_LABELS = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  telegram: 'Telegram',
  facebook: 'Facebook',
  viber: 'Viber',
  tiktok: 'TikTok',
};

const ContactHelper = ({ socials = [] }) => {
  const handlePress = useCallback((url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      if (__DEV__) console.error('Error opening contact URL:', err);
    });
  }, []);

  const visibleSocials = useMemo(
    () =>
      socials
        .filter((social) => {
          const name = social.social_name?.toLowerCase();
          return name && SOCIAL_ICONS[name] && social.social_url;
        })
        .sort((a, b) => {
          const aIndex = SOCIAL_PRIORITY.indexOf(a.social_name.toLowerCase());
          const bIndex = SOCIAL_PRIORITY.indexOf(b.social_name.toLowerCase());
          return aIndex - bIndex;
        })
        .slice(0, MAX_SOCIALS),
    [socials],
  );

  if (!visibleSocials.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact with helper</Text>
      <View style={styles.row}>
        {visibleSocials.map((social) => {
          const name = social.social_name.toLowerCase();

          return (
            <Pressable
              key={social.id}
              style={({ pressed }) => [styles.contactItem, pressed && styles.contactPressed]}
              onPress={() => handlePress(social.social_url)}
            >
              <View style={styles.iconCircle}>
                <HugeiconsIcon
                  icon={SOCIAL_ICONS[name]}
                  size={28}
                  color={TEXT_DARK}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={styles.contactLabel}>{SOCIAL_LABELS[name]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  contactItem: {
    alignItems: 'center',
    gap: 8,
  },
  contactPressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SOFTGREY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_DARK,
  },
});

export default ContactHelper;
