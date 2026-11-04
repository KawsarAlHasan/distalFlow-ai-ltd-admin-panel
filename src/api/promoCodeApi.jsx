import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const usePromoCode = () => {
  const getData = async () => {
    const response = await axios.get("/coupon.json");
    return response.data.data;
  };

  const {
    data: promoCodes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["promoCodes"],
    queryFn: getData,
  });

  return { promoCodes, isLoading, isError, error, refetch };
};
