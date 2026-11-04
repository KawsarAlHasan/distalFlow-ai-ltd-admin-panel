import React, { useState } from "react";
import { Badge, List, message, Spin } from "antd";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";

function Notification({ notification, isLoading, isError, error, refetch }) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await API.put(`/notification/read/${id}`);
      refetch?.();
    } catch (err) {
      console.error("Failed to mark as read:", err);
      message.error("Failed to mark as read");
    }
  };

  // Handle notification click
  const handleNotificationClick = async (id, item) => {
    setIsNavigating(true);
    try {
      await markAsRead(id);

      if (item.type === "order") {
        navigate(`/food-orders`);
      } else if (item.type === "chat") {
        navigate(`/user-massages?sender=${item.typeId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsNavigating(false);
    }
  };

  if (isLoading) return <Spin size="large" className="block mx-auto my-10" />;
  if (isError)
    return (
      <div className="text-center text-red-500">
        {error.message || "Something went wrong"}
      </div>
    );

  return (
    <List
      dataSource={notification?.data}
      renderItem={(item) => (
        <List.Item
          key={item._id}
          className={`mb-2 border-b rounded-md ${
            item.read ? "bg-green-50" : "bg-red-50"
          } hover:bg-gray-100 cursor-pointer`}
        >
          <div
            onClick={() => handleNotificationClick(item._id, item)}
            className="flex justify-between items-center mx-2 w-full"
          >
            <div>
              <p className="font-bold text-blue-600">{item.title}</p>
              <p className="text-sm text-gray-600">
                {item.message?.length > 50
                  ? item.message.slice(0, 50) + "..."
                  : item.message}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            {isNavigating && <Spin size="small" className="ml-2" />}
          </div>
        </List.Item>
      )}
    />
  );
}

export default Notification;
