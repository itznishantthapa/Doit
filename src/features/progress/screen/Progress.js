import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AssignmentsIcon,
  Calendar03Icon,
  Cancel01Icon,
  Edit02Icon,
  FileBlockIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import ProgressStepCard from '../components/ProgressStepCard';
import AssignmentEditSheet from '../components/AssignmentEditSheet';
import {
  buildProgressSteps,
  formatDeliveryDate,
  getAssignmentTypeLabel,
  getWorkTypeLabel,
} from '../data/uiData';
import { useAssignmentProgress } from '../../../hooks/query/query/useAssignmentProgress';
import { useAssignmentSubmissionToggle } from '../../../hooks/custom/useAssignmentSubmissionToggle';
import { ASSIGNMENT_STATUSES } from '../../pending/data/uiData';
import { getApiErrorMessage } from '../../auth/api/api';
import { AVAILABLE_TEXT, BORDER, LAVENDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

 

const MetaChip = ({ icon, label }) => (
  <View style={styles.metaChip}>
    <HugeiconsIcon icon={icon} size={12} color={TEXT_DARK} strokeWidth={2} />
    <Text style={styles.metaChipText} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const AssignmentHeader = ({ assignment, onEditPress, showEditButton }) => {
  const workTypeLabel = getWorkTypeLabel(assignment.work_type);

  const metaItems = [
    {
      key: 'type',
      icon: AssignmentsIcon,
      label: getAssignmentTypeLabel(assignment.assignment_type),
    },
    {
      key: 'delivery',
      icon: Calendar03Icon,
      label: formatDeliveryDate(assignment.delivery_date),
    },
  ];

  return (
    <View style={styles.headerCard}>
      {workTypeLabel ? (
        <Text
          style={[
            styles.workTypeLabel,
          ]}
        >
          {workTypeLabel} 
        </Text>
      ) : null}

      <View style={styles.headerTopRow}>
        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
        {showEditButton ? (
          <Pressable
            onPress={onEditPress}
            hitSlop={8}
          >
            <HugeiconsIcon icon={Edit02Icon} size={20} color={TEXT_DARK} strokeWidth={1.5} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaChips}>
        {metaItems.map((item) => (
          <MetaChip key={item.key} icon={item.icon} label={item.label} />
        ))}
      </View>
    </View>
  );
};

const TimelineDot = ({ isActive, status, accentColor }) => {
  if (!isActive) {
    return <View style={[styles.dot, styles.dotInactive]} />;
  }

  if (status === 'completed') {
    return (
      <View style={[styles.dot, { backgroundColor: accentColor }]}>
        <HugeiconsIcon icon={Tick02Icon} size={12} color={WHITE} strokeWidth={2} />
      </View>
    );
  }

  if (status === 'rejected') {
    return (
      <View style={[styles.dot, { backgroundColor: '#DC2626' }]}>
        <HugeiconsIcon icon={Cancel01Icon} size={12} color={WHITE} strokeWidth={2} />
      </View>
    );
  }

  return (
    <View style={[styles.dot, styles.dotActive, { borderColor: accentColor }]}>
      <View style={[styles.dotInner, { backgroundColor: accentColor }]} />
    </View>
  );
};

const TimelineConnector = ({ active }) => (
  <View style={styles.connector}>
    {Array.from({ length: 8 }).map((_, index) => (
      <View key={index} style={[styles.dash, active && styles.dashActive]} />
    ))}
  </View>
);

const EDITABLE_STATUSES = new Set([
  ASSIGNMENT_STATUSES.IN_REVIEW,
  ASSIGNMENT_STATUSES.UNSUBMITTED,
]);

const Progress = () => {
  const insets = useSafeAreaInsets();
  const { assignmentId } = useRoute().params ?? {};
  const { data: assignment, isLoading, isError, error } = useAssignmentProgress(assignmentId);
  const { isUnsubmitted, isToggleOn, isToggling, loadingLabel, onToggle } =
    useAssignmentSubmissionToggle(assignmentId, assignment?.status);

  const editSheetRef = useRef(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const steps = useMemo(
    () => (assignment ? buildProgressSteps(assignment) : []),
    [assignment],
  );

  const completedStep = steps.find((s) => s.id === 'completed');
  const showDownloadGuide =
    Platform.OS === 'ios' &&
    completedStep?.is_active &&
    completedStep?.status === 'completed';

  const showEditButton = EDITABLE_STATUSES.has(assignment?.status);

  const openEditSheet = useCallback(() => {
    setEditSheetOpen(true);
    editSheetRef.current?.present();
  }, []);

  const closeEditSheet = useCallback(() => {
    editSheetRef.current?.dismiss();
    setEditSheetOpen(false);
  }, []);

  useEffect(() => {
    if (!editSheetOpen) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeEditSheet();
      return true;
    });

    return () => subscription.remove();
  }, [closeEditSheet, editSheetOpen]);

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Assignment Details" />

      {isLoading ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Getting details...</Text>
        </View>
      ) : isError || !assignment ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>
            {getApiErrorMessage(error, 'Assignment not found.')}
          </Text>
        </View>
      ) : (
        <>
          <AssignmentHeader
            assignment={assignment}
            onEditPress={openEditSheet}
            showEditButton={showEditButton}
          />

          {showEditButton ? (
            <AssignmentEditSheet
              sheetRef={editSheetRef}
              bottomInset={insets.bottom}
              isToggleOn={isToggleOn}
              isToggling={isToggling}
              loadingLabel={loadingLabel}
              onToggle={onToggle}
              onDismiss={() => setEditSheetOpen(false)}
            />
          ) : null}

          {isUnsubmitted ? (
            <View style={styles.unsubmittedState}>
              <HugeiconsIcon icon={FileBlockIcon} size={52} color={TEXT_MUTED} strokeWidth={1.5} />
              <Text style={styles.unsubmittedText}>Currently Unsubmitted</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
            >
              <Text style={styles.sectionTitle}>Assignment Progress</Text>

              <View style={styles.timeline}>
                {steps.map((step, index) => (
                  <View key={step.id} style={styles.timelineRow}>
                    <View style={styles.timelineColumn}>
                      <TimelineDot
                        isActive={step.is_active}
                        status={step.status}
                        accentColor={step.accentColor}
                      />
                      {index < steps.length - 1 ? (
                        <TimelineConnector active={step.status === 'completed'} />
                      ) : null}
                    </View>

                    <View style={styles.cardWrap}>
                      <ProgressStepCard
                        step={step}
                        assignmentId={assignmentId}
                        assignmentTitle={assignment.title}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {showDownloadGuide ? (
                <View style={styles.downloadGuideBox}>
                  <Text style={styles.downloadGuideLabel}>File will be downloaded at:</Text>
                  <View style={styles.downloadGuidePath}>
                    {['Files', 'Browse', 'On My iPhone', 'Doit.'].map((segment, index, arr) => (
                      <React.Fragment key={segment}>
                        <Text style={styles.downloadGuideSegment}>{segment}</Text>
                        {index < arr.length - 1 ? (
                          <Text style={styles.downloadGuideArrow}>{'→'}</Text>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          )}
        </>
      )}
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WHITE,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  headerCard: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  workTypeLabel: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8B7CB8',
    backgroundColor: '#F5F6F8',
    alignSelf:'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  assignmentTitle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 20,
    color: TEXT_DARK,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  unsubmittedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  unsubmittedText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  metaChips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: LAVENDER,
  },
  metaChipText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 11,
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  timeline: {},
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 14,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: WHITE,
    borderWidth: 2.5,
  },
  dotInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: WHITE,
    borderWidth: 2.5,
    borderColor: BORDER,
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 5,
    gap: 3,
    flex: 1,
    minHeight: 52,
  },
  dash: {
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: BORDER,
  },
  dashActive: {
    backgroundColor: AVAILABLE_TEXT,
  },
  cardWrap: {
    flex: 1,
    paddingBottom: 14,
  },
  downloadGuideBox: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5F6F8',
    borderRadius: 14,
    gap: 8,
  },
  downloadGuideLabel: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 12,
    color: TEXT_DARK,
  },
  downloadGuidePath: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  downloadGuideSegment: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  downloadGuideArrow: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: '#000000',
  },
});

export default Progress;
