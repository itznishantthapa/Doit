import { API_CLIENT } from "../../../services/client";
import { endpoints } from "../../../services/endpoints";
import { useQuery } from "@tanstack/react-query";

const TEN_MIN = 1000 * 60 * 1;


export const useBanners = () => {
    return useQuery({
        queryKey: ["banners"],
        
        queryFn: async () => {
            const response = await API_CLIENT.get(endpoints.banners);
            return response.data.banners; 
        },
        staleTime: TEN_MIN,
    });
}