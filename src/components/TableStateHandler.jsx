import { Spin, Alert, Button, Empty, Skeleton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

function TableStateHandler({
  isLoading,
  isError,
  error,
  data,
  onRetry,
  children,
}) {
  const status = error?.response?.status;

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  // Error State
  if (isError) {
    if (status === 404) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-10 text-center ">
            <Empty description="No Data Found" />
            <Button
              icon={<ReloadOutlined />}
              onClick={onRetry}
              className="mt-4"
            >
              Reload
            </Button>
          </div>
        </div>
      );
    }

    // Other Errors
    let message = "Something went wrong!";
    let description = error?.message;

    if (status === 500) {
      message = "Server Error";
      description = "Internal server error. Please try again later.";
    }

    return (
      <div className="p-4">
        <Alert
          message={message}
          description={description}
          type="error"
          showIcon
          action={
            <Button danger icon={<ReloadOutlined />} onClick={onRetry}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Empty State (API success but no data)
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center">
        <Empty description="No Content Available" />
      </div>
    );
  }

  // Success
  return children;
}

export default TableStateHandler;
