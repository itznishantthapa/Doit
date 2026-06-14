import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../services/queryClient';
import { apiSubmitPayment } from '../../../features/progress/api/api';
import { assignmentProgressKey } from '../query/useAssignmentProgress';

export const useSubmitPayment = (assignmentId) => {
  const { mutate: submitPayment, isPending: isSubmitting } = useMutation({
    mutationFn: apiSubmitPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentProgressKey(assignmentId) });
    },
  });

  return { submitPayment, isSubmitting };
};
