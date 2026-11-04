import { useQuery } from "@tanstack/react-query";
import { API } from "./api";

export const useAnalytics = ({ startDate, endDate }) => {
  const getData = async () => {
    const response = await API.get(`/settings/analytics`, {
      params: { startDate, endDate },
    });
    return response?.data?.data;
  };

  const {
    data: analyticsData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["analyticsData", startDate, endDate],
    queryFn: getData,
  });

  return { analyticsData, isLoading, isError, error, refetch };
};

export const useSpaAnalytics = ({ startDate, endDate, type }) => {
  const getData = async () => {
    const response = await API.get(`/settings/spa-analytics`, {
      params: { startDate, endDate, type },
    });
    return response?.data?.data;
  };

  const {
    data: spaAnalyticsData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["spaAnalyticsData", startDate, endDate, type],
    queryFn: getData,
  });

  return { spaAnalyticsData, isLoading, isError, error, refetch };
};

export const useDashboardData = () => {
  const getData = async () => {
    const response = await API.get(`/settings/dashboard`);
    return response?.data?.data;
  };

  const {
    data: dashboardData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getData,
  });

  return { dashboardData, isLoading, isError, error, refetch };
};

export const useTermsPrivacy = (filter) => {
  const getData = async () => {
    const response = await API.get(`/settings/${filter}`);
    return response.data;
  };

  const {
    data: termsPrivacy = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["termsPrivacy", filter],
    queryFn: getData,
  });

  return { termsPrivacy, isLoading, isError, error, refetch };
};

export const useBannerData = (type) => {
  const getData = async () => {
    const response = await API.get(`/settings/banner`, {
      params: { type },
    });
    return response?.data?.data;
  };

  const {
    data: bannerData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bannerData", type],
    queryFn: getData,
  });

  return { bannerData, isLoading, isError, error, refetch };
};

export const useAllCoupon = () => {
  const getData = async () => {
    const response = await API.get("/coupon/all");
    return response?.data?.data;
  };

  const {
    data: couponData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["couponData"],
    queryFn: getData,
  });

  return { couponData, isLoading, isError, error, refetch };
};

export const useCheckCoupon = ({ couponCode }, options = {}) => {
  const getData = async () => {
    const response = await API.get(`/coupon/check/${couponCode}`);
    return response?.data?.data;
  };

  const {
    data: couponCheck = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["couponCheck", couponCode],
    queryFn: getData,
    enabled: !!couponCode && (options.enabled ?? true),
  });

  return { couponCheck, isLoading, isError, error, refetch };
};
