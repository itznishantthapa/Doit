import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  File02Icon,
  Image01Icon,
} from '@hugeicons/core-free-icons';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-simple-toast';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import CoolButton from '../../../components/button/CoolButton';
import {
  buildAvailabilityFromBusyDates,
  getNearestAvailableDate,
} from '../mocked/mocked';
import {
  BOOKED_TEXT,
  BORDER,
  AVAILABLE_TEXT,
  GHOSTWHITE,
  LAVENDER,
  MINT,
  PEACH,
  TEXT_DARK,
  TEXT_MUTED,
  WHITE,
} from '../../../constants/colors';
import { useBusyDates } from '../../../hooks/query/query/useBusyDate';

const ASSIGNMENT_TYPES = [
  {
    id: 'assessment',
    title: 'Assessment / Coursework',
    subtitle: 'High weightage marks coursework',
  },
  {
    id: 'tutorial',
    title: 'Tutorial / Workshop',
    subtitle: 'Tutorial or workshop to complete',
  },
  {
    id: 'others',
    title: 'Others',
    subtitle: 'Other academic services like presentation slides, essay writing, etc.',
  },
];

const ASSIGNMENT_COPY = {
  assessment: {
    uploadLabel: 'Assessment outlined paper',
    uploadHint: 'Provide your assessment question paper',
    descriptionPlaceholder: 'Tell us more about your assessment...',
    nameLabel: 'Assessment name',
    namePlaceholder: 'e.g. CNT0P Programming Assessment',
  },
  tutorial: {
    uploadLabel: 'Tutorial question paper',
    uploadHint: 'Provide your tutorial questions paper',
    descriptionPlaceholder: 'Tell us more about your tutorial...',
    nameLabel: 'Tutorial name',
    namePlaceholder: 'e.g. CNT0P Programming Tutorial',
  },
  others: {
    uploadLabel: 'Question Files',
    uploadHint: 'Provide any files related to your request',
    descriptionPlaceholder: 'Tell us more about your service request...',
    nameLabel: 'Service name',
    namePlaceholder: 'e.g. E-commerce Subject Presentation',
  },
};

const WORK_TYPES = [
  { id: 'individual', title: 'Individual' },
  { id: 'group', title: 'Group' },
];

const FOOTER_HEIGHT = 72;

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const CALENDAR_THEME = {
  backgroundColor: WHITE,
  calendarBackground: WHITE,
  textSectionTitleColor: TEXT_MUTED,
  selectedDayBackgroundColor: TEXT_DARK,
  selectedDayTextColor: WHITE,
  todayTextColor: TEXT_DARK,
  dayTextColor: TEXT_DARK,
  textDisabledColor: '#d1d5db',
  arrowColor: TEXT_MUTED,
  monthTextColor: TEXT_DARK,
  textDayFontFamily: 'Jakarta-Regular',
  textMonthFontFamily: 'Jakarta-Bold',
  textDayHeaderFontFamily: 'Jakarta-Regular',
  textDayFontSize: 14,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 12,
};

const OptionCard = ({ title, subtitle, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.optionCard,
      selected && styles.optionCardSelected,
      pressed && styles.optionCardPressed,
    ]}
  >
    <View style={styles.optionCardContent}>
      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
    {selected ? (
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={TEXT_DARK} strokeWidth={1.5} />
    ) : (
      <View style={styles.optionRadio} />
    )}
  </Pressable>
);

const UploadZone = ({ label, hint, files, onAddFile, onAddPhoto, onRemove, error }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.uploadZone, error && styles.inputError]}>
      <HugeiconsIcon icon={CloudUploadIcon} size={28} color={TEXT_DARK} strokeWidth={1.5} />
      <Text style={styles.uploadZoneTitle}>{hint}</Text>
      <Text style={styles.uploadZoneSubtitle}>Files and screenshots supported</Text>
      <View style={styles.uploadActions}>
        <Pressable
          style={({ pressed }) => [styles.uploadActionButton, pressed && styles.uploadActionPressed]}
          onPress={onAddFile}
        >
          <HugeiconsIcon icon={File02Icon} size={14} color={TEXT_DARK} strokeWidth={1.5} />
          <Text style={styles.uploadActionText}>Add file</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.uploadActionButton, pressed && styles.uploadActionPressed]}
          onPress={onAddPhoto}
        >
          <HugeiconsIcon icon={Image01Icon} size={14} color={TEXT_DARK} strokeWidth={1.5} />
          <Text style={styles.uploadActionText}>Screenshot</Text>
        </Pressable>
      </View>
    </View>
    {files.length > 0 && (
      <View style={styles.fileList}>
        {files.map((file) => (
          <View key={file.id} style={styles.fileItem}>
            <HugeiconsIcon
              icon={file.type === 'image' ? Image01Icon : File02Icon}
              size={16}
              color={TEXT_DARK}
              strokeWidth={1.5}
            />
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Pressable onPress={() => onRemove(file.id)} hitSlop={8}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={TEXT_MUTED} strokeWidth={1.5} />
            </Pressable>
          </View>
        ))}
      </View>
    )}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const DeliveryDateCalendar = ({
  selectedDate,
  onSelectDate,
  bookedDates,
  availableDates,
}) => {
  const todayString = toDateString(getToday());
  const selectedDateString = selectedDate ? toDateString(selectedDate) : '';

  const markedDates = useMemo(() => {
    const marks = {};

    availableDates.forEach((dateString) => {
      marks[dateString] = {
        customStyles: {
          container: styles.availableDayContainer,
          text: styles.availableDayText,
        },
      };
    });

    bookedDates.forEach((dateString) => {
      marks[dateString] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: styles.bookedDayContainer,
          text: styles.bookedDayText,
        },
      };
    });

    if (selectedDateString) {
      marks[selectedDateString] = {
        selected: true,
        customStyles: {
          container: styles.selectedDayContainer,
          text: styles.selectedDayText,
        },
      };
    }

    return marks;
  }, [availableDates, bookedDates, selectedDateString]);

  const onDayPress = (day) => {
    const { dateString } = day;

    if (bookedDates.has(dateString)) {
      Toast.show('This date is fully booked.', Toast.SHORT);
      return;
    }

    if (!availableDates.has(dateString)) {
      Toast.show('This date is not available.', Toast.SHORT);
      return;
    }

    onSelectDate(new Date(`${dateString}T12:00:00`));
  };

  return (
    <View style={styles.calendarWrapper}>
      <View style={styles.calendarHeader}>
        <View style={styles.calendarDateChip}>
          <View style={styles.calendarDateIcon}>
            <HugeiconsIcon icon={Calendar03Icon} size={15} color={WHITE} strokeWidth={1.5} />
          </View>
          <View style={styles.calendarDateText}>
            <Text style={styles.calendarDateLabel}>delivered on</Text>
            <Text style={styles.calendarDateValue}>
              {selectedDate ? formatDate(selectedDate) : ''}
            </Text>
          </View>
        </View>
      </View>
      <Calendar
        current={selectedDateString || todayString}
        minDate={todayString}
        markingType="custom"
        markedDates={markedDates}
        onDayPress={onDayPress}
        enableSwipeMonths
        hideExtraDays
        theme={CALENDAR_THEME}
        style={styles.calendar}
      />
      <View style={styles.legendRow}>
        <LegendItem color={MINT} label="Available" />
        <LegendItem color={PEACH} label="Busy" />
      </View>
    </View>
  );
};














const Upload = () => {
  const insets = useSafeAreaInsets();
  const { data: busyDates = [] } = useBusyDates();

  const { bookedDates, availableDates } = useMemo(
    () => buildAvailabilityFromBusyDates(busyDates),
    [busyDates],
  );

  const [assignmentType, setAssignmentType] = useState('assessment');
  const [workType, setWorkType] = useState('individual');
  const [outlineFiles, setOutlineFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [deliveryDate, setDeliveryDate] = useState(null);

  useEffect(() => {
    const nearest = getNearestAvailableDate(availableDates);
    if (!nearest) return;

    setDeliveryDate((current) => {
      if (!current) return nearest;

      const currentKey = toDateString(current);
      if (availableDates.has(currentKey)) return current;

      return nearest;
    });
  }, [availableDates]);

  const copy = ASSIGNMENT_COPY[assignmentType] ?? ASSIGNMENT_COPY.assessment;

  const addFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const picked = result.assets.map((asset) => ({
        id: `${asset.uri}-${Date.now()}-${Math.random()}`,
        name: asset.name,
        uri: asset.uri,
        type: 'document',
      }));
      setOutlineFiles((prev) => {
        const next = [...prev, ...picked];
        if (next.length) {
          setErrors((current) => ({ ...current, files: '' }));
        }
        return next;
      });
    } catch (error) {
      if (__DEV__) console.error('Document picker error:', error);
      Toast.show('Unable to pick file. Please try again.', Toast.SHORT);
    }
  };

  const addPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show('Photo library permission is required.', Toast.SHORT);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const picked = result.assets.map((asset) => ({
        id: `${asset.uri}-${Date.now()}-${Math.random()}`,
        name: asset.fileName ?? `Screenshot-${Date.now()}.jpg`,
        uri: asset.uri,
        type: 'image',
      }));
      setOutlineFiles((prev) => {
        const next = [...prev, ...picked];
        if (next.length) {
          setErrors((current) => ({ ...current, files: '' }));
        }
        return next;
      });
    } catch (error) {
      if (__DEV__) console.error('Image picker error:', error);
      Toast.show('Unable to pick image. Please try again.', Toast.SHORT);
    }
  };

  const removeFile = (id) => {
    setOutlineFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!outlineFiles.length) {
      nextErrors.files = 'Required *';
    }

    if (!description.trim()) {
      nextErrors.description = 'Required *';
    }

    if (!assessmentName.trim()) {
      nextErrors.assessmentName = 'Required *';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!deliveryDate) {
      Toast.show('Please select a delivery date.', Toast.SHORT);
      return;
    }
    setIsSubmitting(true);
    const payload = {
      assignment_type: assignmentType,
      work_type: assignmentType === 'assessment' ? workType : null,
      name: assessmentName.trim(),
      description: description.trim(),
      delivery_date: toDateString(deliveryDate),
      files: outlineFiles.map(({ name, uri, type }) => ({
        name,
        uri,
        type,
      })),
    };


    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Upload payload ready for backend:', payload);

    setIsSubmitting(false);

  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, [])
  );

  return (
    <MyWrapper enableTopInset={true} enableBottomInset={false} style={styles.screen}>
      <ScreenHeader title="Assignment Help" />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={FOOTER_HEIGHT + (Platform.OS === 'android' ? 20 : 30)}
        extraKeyboardSpace={0}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Assignment type</Text>
          <View style={styles.optionList}>
            {ASSIGNMENT_TYPES.map((type) => (
              <OptionCard
                key={type.id}
                title={type.title}
                subtitle={type.subtitle}
                selected={assignmentType === type.id}
                onPress={() => setAssignmentType(type.id)}
              />
            ))}
          </View>
        </View>

        {assignmentType === 'assessment' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Work type</Text>
            <View style={styles.chipRow}>
              {WORK_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setWorkType(type.id)}
                  style={[styles.chip, workType === type.id && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, workType === type.id && styles.chipTextSelected]}>
                    {type.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <UploadZone
          label={copy.uploadLabel}
          hint={copy.uploadHint}
          files={outlineFiles}
          onAddFile={addFile}
          onAddPhoto={addPhoto}
          onRemove={removeFile}
          error={errors.files}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Additional details</Text>
          <TextInput
            style={[styles.textInput, styles.textArea, errors.description && styles.inputError]}
            placeholder={copy.descriptionPlaceholder}
            placeholderTextColor={TEXT_MUTED}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (text.trim()) {
                setErrors((current) => ({ ...current, description: '' }));
              }
            }}
            multiline
            textAlignVertical="top"
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{copy.nameLabel}</Text>
          <TextInput
            style={[styles.textInput, errors.assessmentName && styles.inputError]}
            placeholder={copy.namePlaceholder}
            placeholderTextColor={TEXT_MUTED}
            value={assessmentName}
            onChangeText={(text) => {
              setAssessmentName(text);
              if (text.trim()) {
                setErrors((current) => ({ ...current, assessmentName: '' }));
              }
            }}
          />
          {errors.assessmentName ? <Text style={styles.errorText}>{errors.assessmentName}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Delivery date</Text>
          {deliveryDate ? (
            <DeliveryDateCalendar
              selectedDate={deliveryDate}
              onSelectDate={setDeliveryDate}
              bookedDates={bookedDates}
              availableDates={availableDates}
            />
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: Platform.OS === 'android' ? 0 : 20 }}>
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          <CoolButton
            buttonTitle="Submit Request"
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
    paddingTop: 4,
    paddingBottom: 24,
  },
  section: {
    paddingTop: 20,
  },
  sectionLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  optionList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  optionCardSelected: {
    borderColor: TEXT_DARK,
    backgroundColor: LAVENDER,
  },
  optionCardPressed: {
    opacity: 0.85,
  },
  optionCardContent: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  optionTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 15,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  optionTitleSelected: {
    color: TEXT_DARK,
  },
  optionSubtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  chipSelected: {
    borderColor: TEXT_DARK,
    backgroundColor: LAVENDER,
  },
  chipText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    color: TEXT_MUTED,
  },
  chipTextSelected: {
    fontFamily: 'Jakarta-SemiBold',
    color: TEXT_DARK,
  },
  fieldGroup: {
    paddingTop: 20,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: TEXT_MUTED,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Jakarta-Regular',
    fontSize: 15,
    color: TEXT_DARK,
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  calendarWrapper: {
    borderRadius: 16,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  calendarHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  calendarDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  calendarDateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: TEXT_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateText: {
    gap: 2,
  },
  calendarDateLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  calendarDateValue: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 13,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  calendar: {
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  availableDayContainer: {
    backgroundColor: MINT,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableDayText: {
    color: AVAILABLE_TEXT,
    fontFamily: 'Jakarta-Regular',
  },
  bookedDayContainer: {
    backgroundColor: PEACH,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookedDayText: {
    color: BOOKED_TEXT,
    fontFamily: 'Jakarta-Regular',
  },
  selectedDayContainer: {
    backgroundColor: TEXT_DARK,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: WHITE,
    fontFamily: 'Jakarta-SemiBold',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 11,
    color: TEXT_MUTED,
  },
  uploadZone: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    backgroundColor: MINT,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  uploadZoneTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 4,
  },
  uploadZoneSubtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadActionPressed: {
    opacity: 0.75,
  },
  uploadActionText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: TEXT_DARK,
  },
  fileList: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GHOSTWHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fileName: {
    flex: 1,
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_DARK,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
});

export default Upload;
