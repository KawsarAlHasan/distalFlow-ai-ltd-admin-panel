import { useQuery } from "@tanstack/react-query";
import { API } from "./api";
import axios from "axios";

// get user List
export const useUsersList = () => {
  const getData = async () => {
    const response = await axios.get("/users_100.json");
    return response.data;
  };

  const {
    data: usersList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usersList"],
    queryFn: getData,
  });

  return { usersList, isLoading, isError, error, refetch };
};

// get user List
export const useUsersListd = ({ page = 1, limit = 20, role, status, name }) => {
  const getData = async () => {
    const response = await API.get("/user/all", {
      params: { page, limit, role, status, name },
    });
    return response.data;
  };

  const {
    data: usersList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usersList", page, limit, role, status, name],
    queryFn: getData,
  });

  return { usersList, isLoading, isError, error, refetch };
};

// get user List driver
export const useUsersDriverList = ({
  page = 1,
  limit = 20,
  role,
  status,
  name,
}) => {
  const getData = async () => {
    const response = await API.get("/user/driver", {
      params: { page, limit, role, status, name },
    });
    return response.data;
  };

  const {
    data: usersList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usersList", page, limit, role, status, name],
    queryFn: getData,
  });

  return { usersList, isLoading, isError, error, refetch };
};

// user conversations list for messages
export const useListForMessages = ({ search }) => {
  const getData = async () => {
    const response = await API.get("/message/list", {
      params: { search },
    });
    return response.data.data;
  };

  const {
    data: listForMessages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listForMessages", search],
    queryFn: getData,
  });

  return { listForMessages, isLoading, isError, error, refetch };
};

// get user conversations
export const useConversations = () => {
  const getData = async () => {
    const response = await API.get(`/message/conversations`);
    return response.data.data;
  };

  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getData,
  });

  return { conversations, isLoading, isError, error, refetch };
};

// user conversations list for messages
export const useUsersForMessages = ({ search }) => {
  const getData = async () => {
    const response = await API.get("/message/user-list", {
      params: { search },
    });
    return response.data.data;
  };

  const {
    data: usersForMessages = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["usersForMessages", search],
    queryFn: getData,
  });

  return { usersForMessages, isLoading, isError, error, refetch };
};

// get user conversations
export const useUserConversations = ({ page = 1, limit = 50, userId }) => {
  const getData = async () => {
    const response = await API.get(`/message/admin-conversations/${userId}`, {
      params: { page, limit },
    });
    return response.data.data;
  };

  const {
    data: userConversations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userConversations", page, limit],
    queryFn: getData,
  });

  return { userConversations, isLoading, isError, error, refetch };
};

// drivers assign food orders
export const useAssignFoodOrders = (
  { userID, startDate, endDate },
  options = {},
) => {
  const getData = async ({ queryKey }) => {
    const [_key, userID] = queryKey;
    const response = await API.get(`/food-order/driver-assign/${userID}`, {
      params: { startDate, endDate },
    });
    return response.data;
  };

  const {
    data: assignOrder = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assignOrder", userID, startDate, endDate],
    queryFn: getData,
    enabled: !!userID && (options.enabled ?? true),
  });

  return { assignOrder, isLoading, isError, error, refetch };
};

// get notification
export const useNotification = () => {
  const getData = async () => {
    // const response = await API.get(`/notification/admin-notification`);
    const response = await axios.get("/notification.json");
    return response.data;
  };

  const {
    data: notification = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notification"],
    queryFn: getData,
  });

  return { notification, isLoading, isError, error, refetch };
};
