import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const Unauthorized = ({
  message = "You don't have permission to access this page.",
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Result
        status="403"
        title="403"
        subTitle={message}
        extra={
          <Link to="/">
            <Button className="my-main-button" type="primary">
              Back to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default Unauthorized;
