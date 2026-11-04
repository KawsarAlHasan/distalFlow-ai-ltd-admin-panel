import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

function IsError({ error, refetch }) {
  return (
    <div className="p-4">
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
        action={
          <Button
            danger
            icon={<ReloadOutlined />}
            onClick={refetch}
            className="flex items-center"
          >
            Retry
          </Button>
        }
      />
    </div>
  );
}

export default IsError;
