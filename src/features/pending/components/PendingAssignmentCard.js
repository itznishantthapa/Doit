import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Calendar03Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';

import { MINT, TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';
import { ASSIGNMENT_STATUS_CONFIG, ASSIGNMENT_TYPES } from '../data/uiData';

const formatDeliveryDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const PendingAssignmentCard = ({ assignment, onPress, backgroundColor = MINT }) => {
  const statusConfig = ASSIGNMENT_STATUS_CONFIG[assignment.status];
  const typeLabel = ASSIGNMENT_TYPES[assignment.assignment_type] ?? assignment.assignment_type;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <HugeiconsIcon
            icon={statusConfig?.icon ?? Clock01Icon}
            size={22}
            color={'#000000'}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.titleContent}>
          <Text style={styles.title} numberOfLines={2}>
            {assignment.title}
          </Text>
          <Text style={styles.type} numberOfLines={1}>
            {typeLabel}
          </Text>
        </View>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={20}
          color={TEXT_MUTED}
          strokeWidth={1.5}
        />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.dateRow}>
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={14}
            color={TEXT_MUTED}
            strokeWidth={1.5}
          />
          <Text style={styles.dateText}>{formatDeliveryDate(assignment.delivery_date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusConfig?.color ?? TEXT_MUTED },
            ]}
          >
            {statusConfig?.label ?? assignment.status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  type: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
    letterSpacing: -0.1,
  },
});

export default PendingAssignmentCard;
