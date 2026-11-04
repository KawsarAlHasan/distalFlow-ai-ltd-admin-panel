import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useQandAData = () => {
  const getData = async () => {
    const response = await axios.get("/qanda.json");
    return response.data;
  };

  const {
    data: allQandData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allQandData"],
    queryFn: getData,
  });

  return { allQandData, isLoading, isError, error, refetch };
};

export const usePuzzleGame = () => {
  const getData = async () => {
    const response = await axios.get("/puzzleGame.json");
    return response.data;
  };

  const {
    data: allPuzzleGame = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allPuzzleGame"],
    queryFn: getData,
  });

  return { allPuzzleGame, isLoading, isError, error, refetch };
};
