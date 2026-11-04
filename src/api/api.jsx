import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const API = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// sign out
export const signOutAdmin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminProfile");
  localStorage.removeItem("profileTimestamp");
  localStorage.removeItem("userType");
  window.location.href = "/login";
};

// all admins list
export const useAdminList = () => {
  const getData = async () => {
    const response = await API.get("/admin/all");
    return response.data;
  };

  const {
    data: adminList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminList"],
    queryFn: getData,
  });

  return { adminList, isLoading, isError, error, refetch };
};

// all roles list
export const useRolesList = () => {
  const getData = async () => {
    const response = await API.get("/role/all");
    return response.data;
  };

  const {
    data: rolesList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rolesList"],
    queryFn: getData,
  });

  return { rolesList, isLoading, isError, error, refetch };
};
