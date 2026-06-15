import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../services/queryClient';
import { apiUnsubmitAssignment } from '../../../features/progress/api/api';
import { assignmentProgressKey } from '../query/useAssignmentProgress';
import { ASSIGNMENT_STATUSES } from '../../../features/pending/data/uiData';

export const useToggleAssignmentSubmission = (assignmentId) =>
  useMutation({
    mutationFn: () => apiUnsubmitAssignment(assignmentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: assignmentProgressKey(assignmentId) });

      const previous = queryClient.getQueryData(assignmentProgressKey(assignmentId));

      queryClient.setQueryData(assignmentProgressKey(assignmentId), (current) => {
        if (!current) return current;

        return {
          ...current,
          status:
            current.status === ASSIGNMENT_STATUSES.UNSUBMITTED
              ? ASSIGNMENT_STATUSES.IN_REVIEW
              : ASSIGNMENT_STATUSES.UNSUBMITTED,
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(assignmentProgressKey(assignmentId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: assignmentProgressKey(assignmentId) });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
