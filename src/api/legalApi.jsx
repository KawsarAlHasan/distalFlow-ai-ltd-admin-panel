import { useQuery } from "@tanstack/react-query";
import { API } from "./api";

// Fetch all versions of a document type (TERMS_OF_SERVICE or PRIVACY_POLICY)
export const useLegalDocuments = (type = "TERMS_OF_SERVICE") => {
  const getData = async () => {
    const response = await API.get(`/legal/admin/documents?type=${type}`);
    return response.data.data;
  };

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["legalDocuments", type],
    queryFn: getData,
  });

  return { documents, isLoading, isError, error, refetch };
};

// Fetch full document with sections & acceptances
export const useLegalDocumentDetail = (id) => {
  const getData = async () => {
    if (!id) return null;
    const response = await API.get(`/legal/admin/documents/${id}`);
    return response.data.data;
  };

  const {
    data: document,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["legalDocumentDetail", id],
    queryFn: getData,
    enabled: !!id,
  });

  return { document, isLoading, isError, error, refetch };
};

// Fetch clinic acceptances
export const useClinicAcceptances = (type) => {
  const getData = async () => {
    const url = type ? `/legal/admin/acceptances?type=${type}` : "/legal/admin/acceptances";
    const response = await API.get(url);
    return response.data.data;
  };

  const {
    data: acceptances = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clinicLegalAcceptances", type],
    queryFn: getData,
  });

  return { acceptances, isLoading, isError, error, refetch };
};

// Create new version
export const createDocumentVersionApi = async (payload) => {
  const response = await API.post("/legal/admin/documents", payload);
  return response.data.data;
};

// Update draft document
export const updateDocumentApi = async (id, payload) => {
  const response = await API.patch(`/legal/admin/documents/${id}`, payload);
  return response.data.data;
};

// Publish a version as ACTIVE
export const publishDocumentVersionApi = async (id) => {
  const response = await API.patch(`/legal/admin/documents/${id}/publish`);
  return response.data.data;
};

