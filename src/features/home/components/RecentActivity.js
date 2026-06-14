import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  MoneyReceiveSquareIcon,
  StickyNote02Icon
} from '@hugeicons/core-free-icons';
import { GHOSTWHITE, SOFTGREY, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

const PAYMENT_CARD_BG = '#EDF5FF';

const isPaymentActivity = (title = '') => {
  const lowerTitle = title.toLowerCase();
  return lowerTitle.includes('payment') || lowerTitle.includes('pay');
};

const RecentActivity = ({ activity, onPress }) => {
  const isPayment = activity ? isPaymentActivity(activity.title) : false;

  return (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Recent Alerts</Text>
    {activity ? (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isPayment && styles.paymentCard,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={[styles.iconCircle, isPayment && styles.paymentIconCircle]}>
          <HugeiconsIcon
            icon={isPayment ? MoneyReceiveSquareIcon : StickyNote02Icon}
            size={24}
            color={TEXT_DARK}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.title} numberOfLines={1}>
            {activity.title}
          </Text>
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
};

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
  paymentCard: {
    backgroundColor: PAYMENT_CARD_BG,
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
  paymentIconCircle: {
    backgroundColor: WHITE,
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
