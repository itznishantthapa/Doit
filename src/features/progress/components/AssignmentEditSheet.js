import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toggle from 'react-native-toggle-element';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BORDER, LAVENDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

const INFO_TEXT =
  'You cannot edit or delete the given assignment but you can unsubmit it so helper cannot do further review';

const TOGGLE_TRACK = {
  width: 112,
  height: 52,
  radius: 26,
  borderWidth: 2,
  activeBackgroundColor: LAVENDER,
  inActiveBackgroundColor: BORDER,
  borderActiveColor: LAVENDER,
  borderInActiveColor: BORDER,
};

const TOGGLE_THUMB = {
  width: 44,
  height: 44,
  radius: 22,
  activeBackgroundColor: WHITE,
  inActiveBackgroundColor: WHITE,
};

const TOGGLE_THUMB_STYLE = {
  zIndex: 1,
  elevation: 3,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  borderWidth: 1,
  borderColor: '#D8DDE3',
  justifyContent: 'center',
  alignItems: 'center',
};

const AssignmentEditSheet = ({
  sheetRef,
  bottomInset,
  isToggleOn,
  isToggling,
  loadingLabel,
  onToggle,
  onDismiss,
}) => {
  const renderBackdrop = useCallback(
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

  const statusText =
    isToggling && loadingLabel
      ? loadingLabel
      : isToggleOn
        ? 'Unsubmitted'
        : 'In review';

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.sheetHandle}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: Math.max(bottomInset + 20, 24) }]}
      >
        <View style={styles.toggleWrap}>
          <Toggle
            value={isToggleOn}
            onPress={onToggle}
            disabled={isToggling}
            thumbStyle={TOGGLE_THUMB_STYLE}
            trackBar={TOGGLE_TRACK}
            thumbButton={TOGGLE_THUMB}
          />
        </View>

        <Text style={styles.statusText}>{statusText}</Text>

        <Text style={styles.infoText}>{INFO_TEXT}</Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
  },
  toggleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statusText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 13,
    color: TEXT_DARK,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});

export default AssignmentEditSheet;
