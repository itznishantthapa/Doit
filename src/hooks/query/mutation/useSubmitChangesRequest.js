import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../services/queryClient';
import { apiChangesRequest } from '../../../features/progress/api/api';
import { assignmentProgressKey } from '../query/useAssignmentProgress';

export const useSubmitChangesRequest = (assignmentId) => {
  const { mutate: submitChangesRequest, isPending: isSubmitting } = useMutation({
    mutationFn: apiChangesRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentProgressKey(assignmentId) });
    },
  });

  return { submitChangesRequest, isSubmitting };
};
