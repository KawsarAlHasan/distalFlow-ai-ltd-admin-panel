import { Skeleton } from "antd";

function IsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
}

export default IsLoading;
