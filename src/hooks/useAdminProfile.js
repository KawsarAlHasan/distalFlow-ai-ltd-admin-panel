import { useQuery } from "@tanstack/react-query";
import { API } from "../api/api";

// Cache management utilities
const CACHE_KEYS = {
  PROFILE: "adminProfile",
  TIMESTAMP: "profileTimestamp",
};

const CACHE_VALIDITY = 1 * 60 * 1000; // 1 minutes

const getCachedProfile = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.PROFILE);
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);

    if (!cached || !timestamp) return null;

    const now = Date.now();
    const cacheTime = parseInt(timestamp, 10);

    if (now - cacheTime < CACHE_VALIDITY) {
      return JSON.parse(cached);
    }

    // Cache expired, clear it
    localStorage.removeItem(CACHE_KEYS.PROFILE);
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    return null;
  } catch {
    return null;
  }
};

const saveProfileToCache = (profile) => {
  try {
    localStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error("Failed to save profile to cache:", error);
  }
};

// Clear cache function
export const clearAdminProfileCache = () => {
  localStorage.removeItem(CACHE_KEYS.PROFILE);
  localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
};

// get admin profile with cache
export const useAdminProfile = () => {
  const token = localStorage.getItem("token");
  const cachedProfile = getCachedProfile();

  const { data, isLoading, isError, error, refetch, isFetching, remove } =
    useQuery({
      queryKey: ["adminProfile"],
      queryFn: async () => {
        const response = await API.get("/auth/admin/profile");
        const profileData = response.data.data;

        // Save to cache
        saveProfileToCache(profileData);

        return profileData;
      },
      enabled: !!token,
      staleTime: 1 * 60 * 1000, // 1 minutes stale time
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: !cachedProfile,
      refetchOnReconnect: false,
      retry: 1,
      initialData: cachedProfile || undefined,
      placeholderData: cachedProfile || undefined,
    });

  return {
    adminProfile: data || cachedProfile,
    isLoading: isLoading && !cachedProfile,
    isFetching,
    isError,
    error,
    refetch: async () => {
      // Clear cache before refetching
      clearAdminProfileCache();
      return refetch();
    },
    clearCache: () => {
      clearAdminProfileCache();
      remove();
    },
  };
};
