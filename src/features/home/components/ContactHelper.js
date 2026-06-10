import React, { useCallback } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { InstagramIcon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';

const CONTACT_ICONS = {
  whatsapp: WhatsappIcon,
  instagram: InstagramIcon,
};

const ContactHelper = ({ contacts = [] }) => {
  const handlePress = useCallback((url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      if (__DEV__) console.error('Error opening contact URL:', err);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact with helper</Text>
      <View style={styles.row}>
        {contacts.map((contact) => (
          <Pressable
            key={contact.id}
            style={({ pressed }) => [styles.contactItem, pressed && styles.contactPressed]}
            onPress={() => handlePress(contact.url)}
          >
            <View style={styles.iconCircle}>
              <HugeiconsIcon
                icon={CONTACT_ICONS[contact.id]}
                size={28}
                color={TEXT_DARK}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.contactLabel}>{contact.label}</Text>
          </Pressable>
        ))}
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
    backgroundColor: '#F5F6F8',
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
