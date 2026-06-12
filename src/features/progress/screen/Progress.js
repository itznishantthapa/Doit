import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AssignmentsIcon,
  Calendar03Icon,
  Cancel01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import ProgressStepCard from '../components/ProgressStepCard';
import {
  buildProgressSteps,
  formatDeliveryDate,
  getAssignmentTypeLabel,
} from '../data/uiData';
import { useAssignmentProgress } from '../../../hooks/query/query/useAssignmentProgress';
import { getApiErrorMessage } from '../../auth/api/api';
import { AVAILABLE_TEXT, BORDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

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

const AssignmentHeader = ({ assignment }) => (
  <View style={styles.headerCard}>
    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <HugeiconsIcon icon={AssignmentsIcon} size={14} color={AVAILABLE_TEXT} strokeWidth={1.5} />
        <Text style={styles.metaText}>{getAssignmentTypeLabel(assignment.assignment_type)}</Text>
      </View>
      <View style={styles.metaDivider} />
      <View style={styles.metaItem}>
        <HugeiconsIcon icon={Calendar03Icon} size={14} color={AVAILABLE_TEXT} strokeWidth={1.5} />
        <Text style={styles.metaText}>{formatDeliveryDate(assignment.delivery_date)}</Text>
      </View>
    </View>
  </View>
);

const Progress = () => {
  const insets = useSafeAreaInsets();
  const { assignmentId } = useRoute().params ?? {};
  const { data: assignment, isLoading, isError, error } = useAssignmentProgress(assignmentId);

  const steps = useMemo(
    () => (assignment ? buildProgressSteps(assignment) : []),
    [assignment],
  );

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Assignment Details" />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={TEXT_DARK} />
      ) : isError || !assignment ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>
            {getApiErrorMessage(error, 'Could not load assignment progress.')}
          </Text>
        </View>
      ) : (
        <>
          <AssignmentHeader assignment={assignment} />

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
                      onPress={() => __DEV__ && console.log('Payment pressed:', assignmentId)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
  loader: {
    marginTop: 48,
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
    paddingVertical: 16,
  },
  assignmentTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 20,
    color: TEXT_DARK,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: BORDER,
    marginHorizontal: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 18,
    color: TEXT_DARK,
    letterSpacing: -0.3,
    marginBottom: 20,
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
});

export default Progress;
