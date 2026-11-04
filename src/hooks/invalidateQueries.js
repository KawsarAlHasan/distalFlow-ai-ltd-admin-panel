import { queryClient } from "../main";

export const invalidateQueries = async (queryKey, refetchType = "all") => {
  await queryClient.invalidateQueries({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    refetchType,
  });
};
