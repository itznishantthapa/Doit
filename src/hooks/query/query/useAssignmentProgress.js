import { useQuery } from '@tanstack/react-query';
import { API_CLIENT } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';

const STALE_TIME = 1000 * 30;

export const assignmentProgressKey = (assignmentId) => ['assignmentProgress', assignmentId];

export const useAssignmentProgress = (assignmentId) =>
  useQuery({
    queryKey: assignmentProgressKey(assignmentId),
    queryFn: async () => {
      const { data } = await API_CLIENT.get(endpoints.get_assignment_progress, {
        params: { assignment_id: assignmentId },
      });
      return data.progress;
    },
    enabled: !!assignmentId,
    staleTime: STALE_TIME,
  });
