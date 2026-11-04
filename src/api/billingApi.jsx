import { useQuery } from "@tanstack/react-query";
import { API } from "./api";

// Fetch admin billing & MRR overview
export const useAdminBillingOverview = () => {
  const getData = async () => {
    const response = await API.get("/billing/admin/overview");
    return response.data.data;
  };

  const {
    data: billingData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminBillingOverview"],
    queryFn: getData,
  });

  return { billingData, isLoading, isError, error, refetch };
};

// Retry failed payment for a clinic
export const retryClinicPaymentApi = async (clinicId) => {
  const response = await API.post(`/billing/admin/retry-payment/${clinicId}`);
  return response.data;
};

// Export billing statement
export const exportBillingStatementApi = async () => {
  const response = await API.get("/billing/admin/export-statement");
  return response.data.data;
};

