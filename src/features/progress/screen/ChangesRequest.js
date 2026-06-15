import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import CoolButton from '../../../components/button/CoolButton';
import { useSubmitChangesRequest } from '../../../hooks/query/mutation/useSubmitChangesRequest';
import { getApiErrorMessage } from '../../auth/api/api';
import { BORDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

const FOOTER_HEIGHT = 72;

const ChangesRequest = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { assignmentId, remainingChangesRequests = 0 } = useRoute().params ?? {};
  const { submitChangesRequest, isSubmitting } = useSubmitChangesRequest(assignmentId);
  const [message, setMessage] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const hintText = `You can make ${remainingChangesRequests} more change request${
    remainingChangesRequests === 1 ? '' : 's'
  } on this assignment.`;

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setDescriptionError(true);
      return;
    }

    setDescriptionError(false);
    setSubmitError('');

    submitChangesRequest(
      { assignmentId, description: trimmed },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => {
          setSubmitError(getApiErrorMessage(error, 'Could not submit changes request.'));
        },
      },
    );
  };

  return (
    <MyWrapper enableBottomInset={false} style={styles.screen}>
      <ScreenHeader title="Changes Request" />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={FOOTER_HEIGHT + (Platform.OS === 'android' ? 20 : 30)}
        extraKeyboardSpace={0}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Text style={styles.label}>What changes do you need?</Text>
        <Text style={styles.hint}>{hintText}</Text>

        <TextInput
          style={[styles.textInput, descriptionError && styles.textInputError]}
          placeholder="Write your change request here..."
          placeholderTextColor={TEXT_MUTED}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            if (text.trim()) setDescriptionError(false);
          }}
          multiline
          textAlignVertical="top"
        />

        {descriptionError ? <Text style={styles.errorText}>Required</Text> : null}
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: Platform.OS === 'android' ? 5 : 25 }}>
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <CoolButton
            buttonTitle="Submit"
            onPress={handleSubmit}
            loader={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardStickyView>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WHITE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  label: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 16,
    color: TEXT_DARK,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  hint: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  textInput: {
    minHeight: 280,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: 'Jakarta-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_DARK,
    backgroundColor: WHITE,
  },
  textInputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: '#DC2626',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: WHITE,
  },
});

export default ChangesRequest;
