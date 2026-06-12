import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const ONE_MIN = 1000 * 60 * 1;


export const useUserNotification = () => {
    return useQuery({
        queryKey: ["usernotifications"],
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.get_user_notifications);
            return response.data.notifications; 
        },
        staleTime: ONE_MIN,
    });
}