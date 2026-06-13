import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const TWO_MINUTES = 1000 * 60 * 2;


export const useBusyDates = () => {
    return useQuery({
        queryKey: ["busy_dates"],
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.busyDates);
            return response.data.busy_dates; 
        },
        staleTime: TWO_MINUTES,
    });
}