import { useCallback, useState } from 'react';
import { ASSIGNMENT_STATUSES } from '../../features/pending/data/uiData';
import { useToggleAssignmentSubmission } from '../query/mutation/useToggleAssignmentSubmission';

export const isAssignmentUnsubmitted = (status) => status === ASSIGNMENT_STATUSES.UNSUBMITTED;

export const useAssignmentSubmissionToggle = (assignmentId, status) => {
  const { mutate, isPending: isToggling } = useToggleAssignmentSubmission(assignmentId);
  const [loadingLabel, setLoadingLabel] = useState(null);

  const isUnsubmitted = isAssignmentUnsubmitted(status);
  const isToggleOn = isUnsubmitted;

  const onToggle = useCallback(
    (nextValue) => {
      if (isToggling) return;

      setLoadingLabel(nextValue ? 'Unsubmitting...' : 'Submitting...');

      mutate(undefined, {
        onSettled: () => setLoadingLabel(null),
      });
    },
    [isToggling, mutate],
  );

  return {
    isUnsubmitted,
    isToggleOn,
    isToggling,
    loadingLabel,
    onToggle,
  };
};
