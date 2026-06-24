import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  CardExchange01Icon,
  Copy01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { useNavigation } from '@react-navigation/native';
import LoaderKitView from 'react-native-loader-kit';
import * as ImagePicker from 'expo-image-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import CoolButton from '../../../components/button/CoolButton';
import { useSubmitPayment } from '../../../hooks/query/mutation/useSubmitPayment';
import useDownloadAssignment from '../../../hooks/custom/useDownloadAssignment';
import { BORDER, GHOSTWHITE, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';
import { PROGRESS_STEP_IDS, MAX_CHANGES_REQUESTS } from '../data/uiData';

const REJECTED = { bg: '#FEE2E2', accent: '#DC2626' };
const PAYMENT_GREEN = '#27d935';
const PAYMENT_BG = '#EAF8EB';

const PRICING_SECTIONS = [
  {
    title: 'Assessment / Coursework',
    groups: [
      {
        title: 'Individual',
        items: [
          'Up to 25% weightage: 80 - 100 AUD',
          '25% - 50% weightage: 130 - 150 AUD',
        ],
      },
      {
        title: 'Group',
        items: [
          'Up to 25% weightage: 100 - 150 AUD',
          '25% - 50% weightage: 150 - 300 AUD',
        ],
      },
    ],
  },
  {
    title: 'Tutorials',
    items: ['20 - 30 AUD'],
  },
  {
    title: 'Presentation / Other',
    items: [
      'Presentation: 25 AUD',
      'Other tasks: Need to review',
    ],
  },
];

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

const ProgressStepCard = ({ step, assignmentId, assignmentTitle }) => {
  const navigation = useNavigation();
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [pricingSheetOpen, setPricingSheetOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotError, setScreenshotError] = useState(false);
  const pricingSheetRef = useRef(null);
  const paymentSheetRef = useRef(null);
  const { submitPayment, isSubmitting } = useSubmitPayment(assignmentId);
  const insets = useSafeAreaInsets();
  const renderPricingBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );
  const openPricingSheet = useCallback(() => {
    setPricingSheetOpen(true);
    pricingSheetRef.current?.present();
  }, []);
  const closePricingSheet = useCallback(() => {
    pricingSheetRef.current?.dismiss();
    setPricingSheetOpen(false);
  }, []);
  const closePaymentSheet = useCallback(() => {
    paymentSheetRef.current?.dismiss();
    setPaymentSheetOpen(false);
    setScreenshot(null);
    setScreenshotError(false);
  }, []);

  const pickScreenshot = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setScreenshot(result.assets[0]);
      setScreenshotError(false);
    } catch (error) {
      if (__DEV__) console.error('Payment screenshot picker error:', error);
    }
  }, []);

  useEffect(() => {
    if (!pricingSheetOpen && !paymentSheetOpen) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paymentSheetOpen) {
        closePaymentSheet();
      } else {
        closePricingSheet();
      }
      return true;
    });

    return () => subscription.remove();
  }, [closePaymentSheet, closePricingSheet, paymentSheetOpen, pricingSheetOpen]);

  const isPayment = step.id === PROGRESS_STEP_IDS.PAYMENT;
  const isDoing = step.id === PROGRESS_STEP_IDS.DOING;
  const isCompleted = step.id === PROGRESS_STEP_IDS.COMPLETED;
  const isPaymentVerifying = isPayment && step.is_active && step.status === 'doing';
  const showDoingStepLoader = isDoing && step.is_active && step.status === 'pending';
  const showPaymentLoader = isPaymentVerifying;
  const isDownloadEnabled =
    isCompleted && step.is_active && step.status === 'completed' && !!step.completed_file_url;
  const changesRequestCount = step.changes_request_count ?? 0;
  const remainingChangesRequests = MAX_CHANGES_REQUESTS - changesRequestCount;
  const isCompletedActive =
    isCompleted && step.is_active && step.status === 'completed';
  const showChangesRequestButton = isCompletedActive && remainingChangesRequests > 0;
  const showChangesRequestLimit =
    isCompletedActive && changesRequestCount >= MAX_CHANGES_REQUESTS;

  const openChangesRequest = useCallback(() => {
    navigation.navigate('ChangesRequest', { assignmentId, remainingChangesRequests });
  }, [assignmentId, navigation, remainingChangesRequests]);

  const { download: downloadAssignment, isDownloading, isDownloaded } = useDownloadAssignment({
    fileUrl: step.completed_file_url,
    assignmentTitle: assignmentTitle ?? 'Assignment',
  });
  const isRejected = isPayment && step.is_active && step.status === 'rejected';
  const isPaid = isPayment && step.is_active && step.status === 'completed';
  const showPaymentDue = isPayment && step.is_active && step.status === 'pending' && step.price;
  const showPaymentReceipt = isPayment && step.is_active && !!step.payment_details_image;
  const showPaymentFooter =
    isPayment && step.is_active && (isPaid || showPaymentDue || isPaymentVerifying || isRejected);
  const isPaymentLocked = isPayment && step.is_active && step.is_max_submit_reached;
  const canOpenPaymentSheet =
    isPayment &&
    step.is_active &&
    ['pending', 'doing', 'rejected'].includes(step.status) &&
    !isPaymentLocked;
  const operationType = step.status === 'pending' ? 'post' : 'update';
  const paymentDetails = step.payment_details;
  const paymentDisplayMode = paymentDetails?.pay_qr
    ? 'qr'
    : paymentDetails?.pay_id
      ? 'payid'
      : null;
  const copyPayId = useCallback(() => {
    if (!paymentDetails?.pay_id) return;

    Clipboard.setString(paymentDetails.pay_id);
  }, [paymentDetails?.pay_id]);
  const openPaymentSheet = useCallback(() => {
    if (!canOpenPaymentSheet) return;

    setScreenshot(null);
    setScreenshotError(false);
    setPaymentSheetOpen(true);
    paymentSheetRef.current?.present();
  }, [canOpenPaymentSheet]);

  const handleSubmitPayment = useCallback(() => {
    if (operationType === 'post' && step.is_max_submit_reached) return;

    if (!screenshot) {
      setScreenshotError(true);
      return;
    }

    setScreenshotError(false);

    submitPayment(
      {
        assignmentId,
        operationType,
        screenshot,
      },
      {
        onSuccess: () => closePaymentSheet(),
      },
    );
  }, [
    assignmentId,
    closePaymentSheet,
    operationType,
    screenshot,
    step.is_max_submit_reached,
    submitPayment,
  ]);
  const isPaymentActive = isPayment && step.is_active && !isRejected;
  const accent = isRejected ? REJECTED.accent : isPaymentActive ? PAYMENT_GREEN : step.accentColor;
  const backgroundColor = isRejected
    ? REJECTED.bg
    : isPaymentActive
      ? PAYMENT_BG
      : step.is_active
        ? step.activeBackground
        : step.inactiveBackground;

  const content = (
    <>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: step.is_active ? `${accent}22` : BORDER }]}>
          {showDoingStepLoader ? (
            <LoaderKitView
              style={styles.doingLoader}
              name="BallTrianglePath"
              animationSpeedMultiplier={0.7}
              color={accent}
            />
          ) : showPaymentLoader ? (
            <LoaderKitView
              style={styles.doingLoader}
              name="BallClipRotateMultiple"
              animationSpeedMultiplier={1.0}
              color={accent}
            />
          ) : (
            <HugeiconsIcon
              icon={step.icon}
              size={16}
              color={step.is_active ? accent : TEXT_MUTED}
              strokeWidth={1.5}
            />
          )}
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

      {showPaymentFooter ? (
        <View style={styles.paymentFooter}>
          <View style={styles.paymentLeft}>
            {showPaymentDue ? (
              <Text style={styles.priceLabel}>Total Cost</Text>
            ) : null}
            <View style={styles.paymentActionRow}>
              {isRejected ? (
                <Text style={[styles.paymentTag, { color: REJECTED.accent }]}># REJECTED</Text>
              ) : null}

              {showPaymentDue ? (
                <View
                  style={[
                    styles.paymentActionButton,
                    isPaymentActive && styles.paymentActionButtonOnGreen,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentActionButtonText,
                      isPaymentActive && styles.paymentActionButtonTextOnGreen,
                    ]}
                  >
                    {step.price}
                  </Text>
                </View>
              ) : null}

              {isPaymentVerifying && !step.is_max_submit_reached ? (
                <Pressable
                  onPress={openPaymentSheet}
                  style={({ pressed }) => [
                    styles.paymentActionButton,
                    isPaymentActive && styles.paymentActionButtonOnGreen,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentActionButtonText,
                      isPaymentActive && styles.paymentActionButtonTextOnGreen,
                    ]}
                  >
                    Resubmit
                  </Text>
                </Pressable>
              ) : null}

              {showPaymentReceipt ? (
                <Pressable
                  onPress={() => setReceiptVisible(true)}
                  style={({ pressed }) => [
                    styles.paymentActionButton,
                    isPaymentActive && styles.paymentActionButtonOnGreen,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentActionButtonText,
                      isPaymentActive && styles.paymentActionButtonTextOnGreen,
                    ]}
                  >
                    View Details
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={openPricingSheet}
            style={({ pressed }) => [
              styles.infoButton,
              isPaymentActive && styles.paymentInfoButtonOnGreen,
              pressed && styles.pressed,
            ]}
          >
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={16}
              color={isPaymentActive ? PAYMENT_GREEN : WHITE}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      ) : null}

      {isPayment && !step.is_active ? (
        <View style={styles.inactiveInfoRow}>
          <Pressable
            onPress={openPricingSheet}
            style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
          >
            <HugeiconsIcon icon={InformationCircleIcon} size={16} color={WHITE} strokeWidth={1.5} />
          </Pressable>
        </View>
      ) : null}

      {showPaymentReceipt ? (
        <PaymentReceiptModal
          visible={receiptVisible}
          imageUri={step.payment_details_image}
          onClose={() => setReceiptVisible(false)}
        />
      ) : null}

      {isPayment ? (
        <BottomSheetModal
          ref={pricingSheetRef}
          enableDynamicSizing
          backdropComponent={renderPricingBackdrop}
          enablePanDownToClose
          onDismiss={() => setPricingSheetOpen(false)}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
        >
          <BottomSheetView
            style={[
              styles.paymentSheetContent,
              { paddingBottom: Math.max(insets.bottom+20, 16) },
            ]}
          >
            <View style={styles.paymentSheetHeader}>
              <Text style={styles.paymentSheetTitle}>Task Pricing</Text>
              <Text style={styles.paymentSheetSubtitle}>
                Estimated guide based on task type, weightage, and task complexity.
              </Text>
            </View>

            <View style={styles.receiptCard}>
              <Text style={styles.receiptCardTitle}>{PRICING_SECTIONS[0].title}</Text>
              <View style={styles.receiptDivider} />

              {PRICING_SECTIONS[0].groups.map((group, groupIndex) => (
                <View key={group.title}>
                  {groupIndex > 0 ? <View style={styles.receiptDivider} /> : null}
                  <Text style={styles.pricingGroupTitle}>{group.title}</Text>
                  {group.items.map((item) => (
                    <Text key={item} style={styles.pricingReceiptItem}>
                      {item}
                    </Text>
                  ))}
                </View>
              ))}

              <View style={styles.receiptTear} />
            </View>

            <View style={styles.pricingCardColumn}>
              {PRICING_SECTIONS.slice(1).map((section) => (
                <View key={section.title} style={[styles.receiptCard, styles.pricingSectionCard]}>
                  <Text style={styles.receiptCardTitle}>{section.title}</Text>
                  <View style={styles.pricingSectionDivider} />

                  {section.items.map((item, itemIndex) => (
                    <Text
                      key={item}
                      style={[
                        styles.pricingReceiptItem,
                        itemIndex === section.items.length - 1 && styles.pricingReceiptItemLast,
                      ]}
                    >
                      {item}
                    </Text>
                  ))}

                  <View style={styles.receiptTear} />
                </View>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      ) : null}

      {isPayment ? (
        <BottomSheetModal
          ref={paymentSheetRef}
          enableDynamicSizing
          backdropComponent={renderPricingBackdrop}
          enablePanDownToClose
          onDismiss={() => {
            setPaymentSheetOpen(false);
            setScreenshot(null);
            setScreenshotError(false);
          }}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
        >
          <BottomSheetView
            style={[
              styles.paymentSheetContent,
              { paddingBottom: Math.max(insets.bottom+10, 16) },
            ]}
          >
            <View style={styles.paymentSheetHeader}>
              <Text style={styles.paymentSheetTitle}>
                {operationType === 'post' ? 'Submit Payment' : 'Resubmit Payment'}
              </Text>
              {step.price ? (
                <View style={styles.paymentSheetAmountRow}>
                  <Text style={styles.paymentSheetAmountLabel}>Amount due</Text>
                  <Text style={styles.paymentSheetAmountValue}>{step.price}</Text>
                </View>
              ) : null}
            </View>

            {/* ── Pay-to details receipt card ── */}
            {paymentDisplayMode ? (
              <View style={styles.receiptCard}>
                <Text style={styles.receiptCardTitle}>Pay to</Text>

                <View style={styles.receiptDivider} />

                {paymentDisplayMode === 'qr' ? (
                  <>
                    <Image
                      source={{ uri: paymentDetails.pay_qr }}
                      style={styles.receiptQrImage}
                      resizeMode="contain"
                    />
                    {paymentDetails.pay_description ? (
                      <>
                        <View style={styles.receiptDivider} />
                        <Text style={styles.receiptNote}>{paymentDetails.pay_description}</Text>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    {paymentDetails.pay_name ? (
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptRowLabel}>Name</Text>
                        <Text style={styles.receiptRowValue}>{paymentDetails.pay_name}</Text>
                      </View>
                    ) : null}

                    <View style={styles.receiptDivider} />

                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptRowLabel}>Pay ID</Text>
                      <Pressable
                        onPress={copyPayId}
                        style={({ pressed }) => [styles.receiptCopyRow, pressed && styles.pressed]}
                      >
                        <Text style={[styles.receiptRowValue, styles.receiptRowValueMono]}>
                          {paymentDetails.pay_id}
                        </Text>
                        <HugeiconsIcon icon={Copy01Icon} size={16} color={TEXT_MUTED} strokeWidth={1.5} />
                      </Pressable>
                    </View>
                  </>
                )}

                {/* receipt bottom tear */}
                <View style={styles.receiptTear} />
              </View>
            ) : (
              <View style={styles.receiptCard}>
                <Text style={styles.receiptCardTitle}>Pay to</Text>
                <View style={styles.receiptDivider} />
                <Text style={styles.receiptNote}>
                  Payment details from your helper will appear here shortly.
                </Text>
                <View style={styles.receiptTear} />
              </View>
            )}

            {/* ── Screenshot upload ── */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadSectionLabel}>Payment screenshot</Text>
              <Text style={styles.uploadSectionHint}>Upload a photo of your payment confirmation</Text>
            </View>

            <Pressable
              onPress={pickScreenshot}
              style={({ pressed }) => [
                styles.uploadBox,
                screenshot && styles.uploadBoxFilled,
                screenshotError && styles.uploadBoxError,
                pressed && styles.pressed,
              ]}
            >
              {screenshot ? (
                <View style={styles.uploadFilledContent}>
                  <Image
                    source={{ uri: screenshot.uri }}
                    style={styles.uploadPreviewThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.uploadTextBlock}>
                    <Text style={styles.uploadChangeTitle}>Tap to change</Text>
                    <Text style={styles.uploadChangeSubtitle}>payment screenshot</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.uploadPlaceholder}>Tap to upload</Text>
              )}
            </Pressable>

            {screenshotError ? (
              <Text style={styles.uploadErrorText}>Required</Text>
            ) : null}

            {operationType === 'post' && step.is_max_submit_reached ? (
              <Text style={styles.limitText}>Maximum payment attempts reached.</Text>
            ) : null}

            <CoolButton
              buttonTitle={operationType === 'post' ? 'Submit Payment' : 'Update Payment'}
              loader={isSubmitting}
              disabled={isSubmitting || (operationType === 'post' && step.is_max_submit_reached)}
              onPress={handleSubmitPayment}
            />
          </BottomSheetView>
        </BottomSheetModal>
      ) : null}

      {isCompleted ? (
        <View style={styles.completedActionsRow}>
          <Pressable
            disabled={!isDownloadEnabled || isDownloading || isDownloaded}
            onPress={downloadAssignment}
            style={({ pressed }) => [
              styles.downloadButton,
              styles.downloadButtonFlex,
              !isDownloadEnabled && styles.downloadButtonDisabled,
              isDownloaded && styles.downloadButtonDone,
              isDownloadEnabled && !isDownloading && !isDownloaded && pressed && styles.pressed,
            ]}
          >
            {isDownloading ? (
              <LoaderKitView
                style={styles.downloadLoader}
                name="BallBeat"
                animationSpeedMultiplier={1.0}
                color={WHITE}
              />
            ) : (
              <Text
                style={[
                  styles.downloadButtonText,
                  !isDownloadEnabled && styles.downloadButtonTextDisabled,
                ]}
              >
                {isDownloaded ? 'Downloaded' : 'Download Assignment'}
              </Text>
            )}
          </Pressable>

          {showChangesRequestButton ? (
            <Pressable
              onPress={openChangesRequest}
              hitSlop={8}
              style={({ pressed }) => [
                styles.changesRequestButton,
                pressed && styles.pressed,
              ]}
            >
              <HugeiconsIcon icon={CardExchange01Icon} size={18} color={WHITE} strokeWidth={1.5} />
            </Pressable>
          ) : showChangesRequestLimit ? (
            <View style={styles.changesRequestLimitBadge}>
              <Text style={styles.changesRequestLimitBadgeText}>
                {MAX_CHANGES_REQUESTS}/{MAX_CHANGES_REQUESTS}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  const cardStyle = [
    styles.card,
    { backgroundColor },
    isPaymentLocked && styles.cardDisabled,
  ];

  if (canOpenPaymentSheet) {
    return (
      <Pressable
        onPress={openPaymentSheet}
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
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.9,
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
  doingLoader: {
    width: 24,
    height: 24,
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
  paymentActionButtonOnGreen: { backgroundColor: WHITE },
  paymentActionButtonTextOnGreen: { color: PAYMENT_GREEN },
  paymentInfoButtonOnGreen: { backgroundColor: WHITE },
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
  paymentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentActionButton: {
    backgroundColor: TEXT_DARK,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paymentActionButtonText: {
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
  completedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  changesRequestButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXT_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changesRequestLimitBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GHOSTWHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  changesRequestLimitBadgeText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  downloadButton: {
    backgroundColor: TEXT_DARK,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  downloadButtonFlex: {
    flex: 1,
  },
  downloadButtonDone: {
    backgroundColor: '#2F6B52',
  },
  downloadButtonDisabled: {
    backgroundColor: BORDER,
  },
  downloadLoader: {
    width: 36,
    height: 16,
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
  sheetBackground: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: BORDER,
  },
  pricingCardColumn: {
    gap: 8,
  },
  pricingSectionCard: {
    alignSelf: 'stretch',
    paddingTop: 12,
  },
  pricingSectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  pricingGroupTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: TEXT_DARK,
    marginBottom: 6,
  },
  pricingReceiptItem: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  pricingReceiptItemLast: {
    marginBottom: 0,
  },
  paymentSheetContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  paymentSheetHeader: {
    alignItems: 'center',
    paddingBottom: 4,
    gap: 6,
  },
  paymentSheetTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 20,
    color: TEXT_DARK,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  paymentSheetSubtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 300,
  },
  paymentSheetAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  paymentSheetAmountLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  paymentSheetAmountValue: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 18,
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  receiptCard: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  receiptCardTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  receiptDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 2,
  },
  receiptRowLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    flex: 1,
  },
  receiptRowValue: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 14,
    color: TEXT_DARK,
    flex: 2,
    textAlign: 'right',
  },
  receiptRowValueMono: {
    letterSpacing: 0.4,
  },
  receiptCopyRow: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  receiptQrImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  receiptNote: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: TEXT_MUTED,
    marginBottom: 10,
    textAlign: 'center',
  },
  receiptTear: {
    height: 12,
  },
  uploadSection: {
    gap: 2,
  },
  uploadSectionLabel: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: TEXT_DARK,
  },
  uploadSectionHint: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  uploadBox: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
  },
  uploadBoxError: {
    borderColor: '#DC2626',
    borderStyle: 'solid',
  },
  uploadFilledContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    gap: 14,
  },
  uploadPreviewThumb: {
    width: 72,
    height: 96,
    borderRadius: 12,
    backgroundColor: BORDER,
  },
  uploadTextBlock: {
    flex: 1,
    gap: 4,
  },
  uploadChangeTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 16,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  uploadChangeSubtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  uploadPlaceholder: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  uploadErrorText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
  },
  limitText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
});

export default ProgressStepCard;
