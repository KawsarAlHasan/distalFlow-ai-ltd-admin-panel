import { useQuery } from "@tanstack/react-query";
import { API } from "./api";

export const usePlanData = () => {
    const getData = async () => {
        const response = await API.get("/plan")
        return response.data.data;
    };

    const {
        data: allPlan = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["allPlan"],
        queryFn: getData,
    });

    return { allPlan, isLoading, isError, error, refetch };
};
