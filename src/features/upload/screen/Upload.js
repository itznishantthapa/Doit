import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import {
  PRIMARY,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  TEXT_DARK,
  TEXT_MUTED,
  BORDER,
} from '../../../constants/colors';

// ─── Constants ───────────────────────────────────────────────────────────────

const ASSIGNMENT_TYPES = [
  {
    id: 'assessment',
    title: 'Assessment / Coursework',
    subtitle: 'High weightage marks coursework',
  },
  {
    id: 'tutorial',
    title: 'Tutorial',
    subtitle: 'Daily or weekly tasks to complete',
  },
];

const WORK_TYPES = [
  { id: 'individual', title: 'Individual' },
  { id: 'group', title: 'Group' },
];

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleSelected]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {selected ? (
      <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />
    ) : (
      <View style={styles.optionRadio} />
    )}
  </Pressable>
);

const UploadZone = ({ label, hint, files, onAddFile, onAddPhoto, onRemove }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.uploadZone}>
      <MaterialCommunityIcons name="cloud-upload-outline" size={28} color={PRIMARY} />
      <Text style={styles.uploadZoneTitle}>{hint}</Text>
      <Text style={styles.uploadZoneSubtitle}>Files and screenshots supported</Text>
      <View style={styles.uploadActions}>
        <Pressable
          style={({ pressed }) => [styles.uploadActionButton, pressed && styles.uploadActionPressed]}
          onPress={onAddFile}
        >
          <Ionicons name="document-outline" size={14} color={PRIMARY_DARK} />
          <Text style={styles.uploadActionText}>Add file</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.uploadActionButton, pressed && styles.uploadActionPressed]}
          onPress={onAddPhoto}
        >
          <Ionicons name="image-outline" size={14} color={PRIMARY_DARK} />
          <Text style={styles.uploadActionText}>Screenshot</Text>
        </Pressable>
      </View>
    </View>
    {files.length > 0 && (
      <View style={styles.fileList}>
        {files.map((file) => (
          <View key={file.id} style={styles.fileItem}>
            <Ionicons
              name={file.type === 'image' ? 'image-outline' : 'document-outline'}
              size={16}
              color={PRIMARY_DARK}
            />
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Pressable onPress={() => onRemove(file.id)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
            </Pressable>
          </View>
        ))}
      </View>
    )}
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const Upload = () => {
  const insets = useSafeAreaInsets();

  const [assignmentType, setAssignmentType] = useState('assessment');
  const [workType, setWorkType] = useState('individual');
  const [outlineFiles, setOutlineFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addFile = async () => {
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
    setOutlineFiles((prev) => [...prev, ...picked]);
  };

  const addPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      mediaTypes: ['images'],
    });
    if (result.canceled) return;
    const picked = result.assets.map((asset) => ({
      id: `${asset.uri}-${Date.now()}-${Math.random()}`,
      name: asset.fileName ?? `Screenshot-${Date.now()}.jpg`,
      uri: asset.uri,
      type: 'image',
    }));
    setOutlineFiles((prev) => [...prev, ...picked]);
  };

  const removeFile = (id) => {
    setOutlineFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) setDeliveryDate(selectedDate);
  };

  return (
    <MyWrapper enableTopInset={false} enableBottomInset={false} style={styles.screen}>
      <ScreenHeader title="Assignment Help" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Assignment Type */}
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

        {/* Work Type — assessment only */}
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
                  <Text
                    style={[
                      styles.chipText,
                      workType === type.id && styles.chipTextSelected,
                    ]}
                  >
                    {type.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Upload */}
        <UploadZone
          label={assignmentType === 'assessment' ? "Assessment outlined paper" : "Tutorial question paper"}
          hint={assignmentType === 'assessment' ? "Provide your assessment questions" : "Provide your tutorial questions"}
          files={outlineFiles}
          onAddFile={addFile}
          onAddPhoto={addPhoto}
          onRemove={removeFile}
        />

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Additional details</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder={assignmentType === 'assessment' ? "Tell us more about your assessment..." : "Tell us more about your tutorial..."}
            placeholderTextColor={TEXT_MUTED}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Assessment Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{assignmentType === 'assessment' ? "Assessment name" : "Tutorial name"}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={assignmentType === 'assessment' ? "e.g. CNT0P Programming Assessment" : "e.g. CNT0P Programming Tutorial"}
            placeholderTextColor={TEXT_MUTED}
            value={assessmentName}
            onChangeText={setAssessmentName}
          />
        </View>

        {/* Delivery Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Delivery date</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={PRIMARY} />
            <Text style={styles.dateButtonText}>{formatDate(deliveryDate)}</Text>
            <Ionicons name="chevron-down" size={16} color={TEXT_MUTED} />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={deliveryDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <Pressable
              style={styles.dateDoneButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.dateDoneText}>Done</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
        >
          <Text style={styles.submitText}>Submit Request</Text>
        </Pressable>
      </View>
    </MyWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scroll: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  section: {
    paddingTop: 24,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  optionList: { gap: 8 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#ffffff',
  },

  optionCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },

  optionCardPressed: { opacity: 0.8 },

  optionCardContent: {
    flex: 1,
    paddingRight: 12,
    gap: 3,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_DARK,
  },

  optionTitleSelected: { color: PRIMARY_DARK },

  optionSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },

  optionSubtitleSelected: { color: '#7b9de3' },

  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
  },

  chipRow: { flexDirection: 'row', gap: 8 },

  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },

  chipSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
  },

  chipTextSelected: { color: PRIMARY_DARK },

  fieldGroup: {
    paddingTop: 20,
    gap: 8,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },

  textInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: TEXT_DARK,
    backgroundColor: '#ffffff',
  },

  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },

  dateButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_DARK,
  },

  dateDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },

  dateDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_DARK,
  },

  uploadZone: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_LIGHT,
    gap: 4,
  },

  uploadZoneTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 4,
  },

  uploadZoneSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 6,
  },

  uploadActions: {
    flexDirection: 'row',
    gap: 8,
  },

  uploadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  uploadActionPressed: { opacity: 0.75 },

  uploadActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY_DARK,
  },

  fileList: { gap: 8 },

  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  fileName: {
    flex: 1,
    fontSize: 12,
    color: TEXT_DARK,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  submitPressed: { opacity: 0.88 },

  submitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default Upload;