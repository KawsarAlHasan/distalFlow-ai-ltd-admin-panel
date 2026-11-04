import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "./api";

// Fetch all plans with active/legacy price history & subscriber counts
export const usePlanData = () => {
  const getData = async () => {
    const response = await API.get("/plan");
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

// Fetch clinic pricing overrides
export const useOverridesData = () => {
  const getData = async () => {
    const response = await API.get("/plan/overrides");
    return response.data.data;
  };

  const {
    data: overrides = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["planOverrides"],
    queryFn: getData,
  });

  return { overrides, isLoading, isError, error, refetch };
};

// Fetch plan audit logs
export const usePlanAuditLog = () => {
  const getData = async () => {
    const response = await API.get("/plan/audit-log");
    return response.data.data;
  };

  const {
    data: auditLog = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["planAuditLog"],
    queryFn: getData,
  });

  return { auditLog, isLoading, isError, error, refetch };
};

// Mutations
export const createPriceApi = async ({ planType, amount, setupFee }) => {
  const response = await API.post(`/plan/${planType}/prices`, { amount, setupFee });
  return response.data.data;
};

export const migrateSubscribersApi = async ({ planType, priceId, mode }) => {
  const response = await API.post(`/plan/${planType}/migrate`, { priceId, mode });
  return response.data.data;
};

export const createOverrideApi = async (payload) => {
  const response = await API.post("/plan/overrides", payload);
  return response.data.data;
};

export const deleteOverrideApi = async (id) => {
  const response = await API.delete(`/plan/overrides/${id}`);
  return response.data.data;
};
