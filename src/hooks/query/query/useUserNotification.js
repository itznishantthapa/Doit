import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const ONE_AND_A_HALF_MINUTES = 1000 * 60 * 1.5;

export const USER_NOTIFICATIONS_QUERY_KEY = ["usernotifications"];

export const useUserNotification = () => {
    return useQuery({
        queryKey: USER_NOTIFICATIONS_QUERY_KEY,
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.get_user_notifications);
            return response.data.notifications; 
        },
        staleTime: ONE_AND_A_HALF_MINUTES,
        refetchOnMount: true,
    });
}