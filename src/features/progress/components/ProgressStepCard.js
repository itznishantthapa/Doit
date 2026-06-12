import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import Toast from 'react-native-simple-toast';
import { BORDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';
import { PROGRESS_STEP_IDS } from '../data/uiData';

const REJECTED = { bg: '#FEE2E2', accent: '#DC2626' };

const PaymentReceiptModal = ({ visible, imageUri, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Payment Details</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <HugeiconsIcon icon={Cancel01Icon} size={22} color={TEXT_DARK} strokeWidth={1.5} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: imageUri }} style={styles.receiptImage} resizeMode="contain" />
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const ProgressStepCard = ({ step, onPress }) => {
  const [receiptVisible, setReceiptVisible] = useState(false);
  const isPayment = step.id === PROGRESS_STEP_IDS.PAYMENT;
  const isCompleted = step.id === PROGRESS_STEP_IDS.COMPLETED;
  const isDownloadEnabled = isCompleted && step.is_active && step.status === 'completed';
  const isRejected = isPayment && step.is_active && step.status === 'rejected';
  const isPaid = isPayment && step.is_active && step.status === 'completed';
  const showPaymentDue = isPayment && step.is_active && step.status === 'pending' && step.price;
  const accent = isRejected ? REJECTED.accent : step.accentColor;
  const backgroundColor = isRejected
    ? REJECTED.bg
    : step.is_active
      ? step.activeBackground
      : step.inactiveBackground;

  const content = (
    <>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: step.is_active ? `${accent}22` : BORDER }]}>
          <HugeiconsIcon
            icon={step.icon}
            size={16}
            color={step.is_active ? accent : TEXT_MUTED}
            strokeWidth={1.5}
          />
        </View>
        {step.date ? (
          <Text style={[styles.date, { color: step.is_active ? accent : TEXT_MUTED }]}>{step.date}</Text>
        ) : null}
      </View>

      <Text style={[styles.title, !step.is_active && styles.titleInactive]}>{step.title}</Text>

      {step.description ? (
        <Text style={[styles.description, isRejected && styles.descriptionRejected]}>
          {step.description}
        </Text>
      ) : null}

      {isPayment && step.is_active && (isPaid || showPaymentDue || isRejected) ? (
        <View style={styles.paymentFooter}>
          <View style={styles.paymentLeft}>
            {isRejected ? (
              <Text style={[styles.paymentTag, { color: REJECTED.accent }]}># REJECTED</Text>
            ) : isPaid ? (
              <Text style={styles.paymentTag}># PAID</Text>
            ) : (
              <>
                <Text style={styles.priceLabel}>Total Cost</Text>
                <View style={styles.priceRow}>
                  <View style={[styles.pricePill, { backgroundColor: accent }]}>
                    <Text style={styles.priceValue}>{step.price}</Text>
                  </View>
                  {step.payment_details_image ? (
                    <Pressable
                      onPress={() => setReceiptVisible(true)}
                      style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            )}
          </View>
          <Pressable
            onPress={() => Toast.show('Pricing info coming soon.', Toast.SHORT)}
            style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
          >
            <HugeiconsIcon icon={InformationCircleIcon} size={16} color={WHITE} strokeWidth={1.5} />
          </Pressable>
        </View>
      ) : null}

      {isPayment && !step.is_active ? (
        <View style={styles.inactiveInfoRow}>
          <Pressable
            onPress={() => Toast.show('Pricing info coming soon.', Toast.SHORT)}
            style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
          >
            <HugeiconsIcon icon={InformationCircleIcon} size={16} color={WHITE} strokeWidth={1.5} />
          </Pressable>
        </View>
      ) : null}

      {showPaymentDue && step.payment_details_image ? (
        <PaymentReceiptModal
          visible={receiptVisible}
          imageUri={step.payment_details_image}
          onClose={() => setReceiptVisible(false)}
        />
      ) : null}

      {isCompleted ? (
        <Pressable
          disabled={!isDownloadEnabled}
          onPress={() => Toast.show('Download coming soon.', Toast.SHORT)}
          style={({ pressed }) => [
            styles.downloadButton,
            !isDownloadEnabled && styles.downloadButtonDisabled,
            isDownloadEnabled && pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.downloadButtonText,
              !isDownloadEnabled && styles.downloadButtonTextDisabled,
            ]}
          >
            Download Assignment
          </Text>
        </Pressable>
      ) : null}
    </>
  );

  const cardStyle = [styles.card, { backgroundColor }];

  if (isPayment && step.is_active) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.85 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: TEXT_DARK,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  titleInactive: { color: TEXT_MUTED },
  description: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_MUTED,
  },
  descriptionRejected: { color: '#991B1B' },
  paymentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    gap: 12,
  },
  paymentLeft: { flex: 1, gap: 6 },
  priceLabel: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
    color: TEXT_MUTED,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  pricePill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priceValue: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 14,
    color: WHITE,
  },
  detailsButton: {
    backgroundColor: '#2F6B52',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailsButtonText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: WHITE,
  },
  paymentTag: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 18,
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  inactiveInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TEXT_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    marginTop: 14,
    backgroundColor: TEXT_DARK,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: BORDER,
  },
  downloadButtonText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: WHITE,
  },
  downloadButtonTextDisabled: {
    color: TEXT_MUTED,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '82%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  modalTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 16,
    color: TEXT_DARK,
  },
  modalContent: { padding: 16 },
  receiptImage: {
    width: '100%',
    height: 420,
    borderRadius: 10,
    backgroundColor: '#F5F6F8',
  },
});

export default ProgressStepCard;
