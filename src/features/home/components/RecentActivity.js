import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, TaskDone01Icon } from '@hugeicons/core-free-icons';
import { GHOSTWHITE, SOFTGREY, TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';

const RecentActivity = ({ activity, onPress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Recent Alerts</Text>
    {activity ? (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <View style={styles.iconCircle}>
          <HugeiconsIcon
            icon={activity.icon ?? TaskDone01Icon}
            size={24}
            color={TEXT_DARK}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        </View>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={20}
          color={TEXT_MUTED}
          strokeWidth={1.5}
        />
      </Pressable>
    ) : (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No Recent Alerts</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GHOSTWHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SOFTGREY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GHOSTWHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 28,
  },
  emptyText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
});

export default RecentActivity;
