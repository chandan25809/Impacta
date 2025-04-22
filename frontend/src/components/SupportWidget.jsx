// src/components/SupportWidget.jsx

import { Button, Dropdown } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function SupportWidget() {
  const navigate = useNavigate();

  const items = [
    {
      key: "terms",
      label: (
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms & Policies
        </a>
      ),
    },
    {
      key: "report",
      label: <span onClick={() => navigate("/support")}>Report a Problem</span>,
    },
  ];

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <Dropdown menu={{ items }} placement="topRight" arrow>
        <Button
          shape="circle"
          size="large"
          icon={<QuestionCircleOutlined />}
          type="primary"
        />
      </Dropdown>
    </div>
  );
}
