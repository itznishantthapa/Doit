import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const TEN_MINUTES = 1000 * 60 * 10;


export const useSocials = () => {
    return useQuery({
        queryKey: ["socials"],
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.socials);
            return response.data.socials; 
        },
        staleTime: TEN_MINUTES,
    });
}