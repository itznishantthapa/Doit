import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../services/queryClient";
import { apiLoginWithGoogle } from "../api/api";

 

// KEY
const AUTH_QUERY_KEY = ['authUser'];



export const useAuth = () => {


  const { data: authUser, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });

 
  // Use Mutation
  const googleLoginMutation = useMutation({
    mutationFn: apiLoginWithGoogle,
    onSuccess: (data) => {
      // Set the global auth state on a successful backend response
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
    onError: (error) => {
      if (__DEV__) console.error('Backend Auth Error:', error);
    }
  });
  

  // Logout
  const logout = () => {
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
  };


  return {
    authUser,
    isLoading,
    googleLogin: googleLoginMutation.mutate,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    logout,
  };

};