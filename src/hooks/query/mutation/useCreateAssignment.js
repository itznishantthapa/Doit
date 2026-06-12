import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { queryClient } from '../../../services/queryClient';
import { apiCreateAssignment } from '../../../features/upload/api/api';





export const useCreateAssignment = () => {
  
  const navigation = useNavigation();

  const { mutate: createAssignment, isPending: isSubmitting } = useMutation({
    mutationFn: apiCreateAssignment,

    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['assignments', 'pending'] });
      queryClient.removeQueries({ queryKey: ['assignments', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['assignments', 'all'] });
      navigation.replace('Pending');
    },

    onError: (error) => {
      if (__DEV__) {
        console.log(error);
      }
    },
  });

  return { createAssignment, isSubmitting };
};
