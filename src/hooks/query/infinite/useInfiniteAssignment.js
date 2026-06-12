import { useInfiniteQuery } from '@tanstack/react-query';
import { API_CLIENT } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';


const PAGE_SIZE = 10;

export const useInfiniteAssignment = (status, limit = PAGE_SIZE) =>
  
  useInfiniteQuery({
    queryKey: ['assignments', status],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await API_CLIENT.get(endpoints.get_infinite_assignments, {
        params: { offset: pageParam, limit, status },
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage?.next_offset ?? undefined,
    staleTime: 30000, // 30 seconds
  });
