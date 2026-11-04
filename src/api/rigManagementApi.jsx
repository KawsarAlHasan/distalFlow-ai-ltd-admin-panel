import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useRigManagement = () => {
  const getData = async () => {
    const response = await axios.get("/rigMan.json");
    return response.data;
  };

  const {
    data: allRigs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allRigs"],
    queryFn: getData,
  });

  return { allRigs, isLoading, isError, error, refetch };
};
