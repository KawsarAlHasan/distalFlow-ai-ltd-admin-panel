import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useAllVideos = () => {
  const getData = async () => {
    const response = await axios.get("/videos.json");
    return response.data;
  };

  const {
    data: allVideos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allVideos"],
    queryFn: getData,
  });

  return { allVideos, isLoading, isError, error, refetch };
};

export const useAllMessages = () => {
  const getData = async () => {
    const response = await axios.get("/messageContent.json");
    return response.data;
  };

  const {
    data: allMessages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allMessages"],
    queryFn: getData,
  });

  return { allMessages, isLoading, isError, error, refetch };
};

export const useAllAlerts = () => {
  const getData = async () => {
    const response = await axios.get("/alertContent.json");
    return response.data;
  };

  const {
    data: allAlerts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allAlerts"],
    queryFn: getData,
  });

  return { allAlerts, isLoading, isError, error, refetch };
};

export const useAllCardType = () => {
  const getData = async () => {
    const response = await axios.get("/cardType.json");
    return response.data;
  };

  const {
    data: allCardType = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allCardType"],
    queryFn: getData,
  });

  return { allCardType, isLoading, isError, error, refetch };
};

export const useAllRigType = () => {
  const getData = async () => {
    const response = await axios.get("/rigType.json");
    return response.data;
  };

  const {
    data: allRigType = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allRigType"],
    queryFn: getData,
  });

  return { allRigType, isLoading, isError, error, refetch };
};

export const useAllHazardCategory = () => {
  const getData = async () => {
    const response = await axios.get("/hazard.json");
    return response.data;
  };

  const {
    data: allHazardCategory = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allHazardCategory"],
    queryFn: getData,
  });

  return { allHazardCategory, isLoading, isError, error, refetch };
};
