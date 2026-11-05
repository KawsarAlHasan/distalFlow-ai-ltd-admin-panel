import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "./api";

// Fetch clinics list with search, status filter, and pagination
export const useClinics = ({ search = "", status = "All", page = 1, limit = 50 } = {}) => {
  const getData = async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (status && status !== "All") params.append("status", status);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await API.get(`/clinic?${params.toString()}`);
    return response.data.data;
  };

  const {
    data: clinicData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminClinics", { search, status, page, limit }],
    queryFn: getData,
    keepPreviousData: true,
  });

  return {
    clinics: clinicData?.clinics || [],
    meta: clinicData?.meta || { page: 1, limit, total: 0, totalPages: 1 },
    stats: clinicData?.stats || {
      totalClinics: 0,
      active: 0,
      inGrace: 0,
      onboarding: 0,
      suspended: 0,
    },
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

// Fetch single clinic details by ID
export const useClinicDetails = (clinicId) => {
  const getData = async () => {
    if (!clinicId) return null;
    const response = await API.get(`/clinic/${clinicId}`);
    return response.data.data;
  };

  const {
    data: clinic,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clinicDetails", clinicId],
    queryFn: getData,
    enabled: !!clinicId,
  });

  return { clinic, isLoading, isError, error, refetch };
};

// Update clinic status (ACTIVE, SUSPENDED, INACTIVE, PENDING)
export const updateClinicStatusApi = async ({ clinicId, status }) => {
  const response = await API.patch(`/clinic/${clinicId}/status`, { status });
  return response.data;
};

