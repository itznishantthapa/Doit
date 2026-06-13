import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const TEN_MINUTES = 1000 * 60 * 10;

export const USER_NOTIFICATIONS_QUERY_KEY = ["usernotifications"];

export const useUserNotification = () => {
    return useQuery({
        queryKey: USER_NOTIFICATIONS_QUERY_KEY,
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.get_user_notifications);
            return response.data.notifications; 
        },
        staleTime: TEN_MINUTES,
    });
}