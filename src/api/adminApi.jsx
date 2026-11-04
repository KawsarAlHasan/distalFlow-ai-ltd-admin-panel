import { useQuery } from "@tanstack/react-query";
import { API } from "./api";

export const useAllAdmins = (status) => {
  const getData = async () => {
    const response = await API.get("/admin", {
      params: {
        status,
      },
    });

    return response.data.data;
  };

  const {
    data: allAdmins = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allAdmins", status],
    queryFn: getData,
  });

  return { allAdmins, isLoading, isError, error, refetch };
};
