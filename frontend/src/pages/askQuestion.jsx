import { Form, Input, Select, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const { TextArea } = Input;

export default function AskQuestion() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/campaigns", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          
          validateStatus: (status) => status === 200 || status === 304
          
        });
        // console.log("question",response);
  
        const campaigns = response.data?.campaigns || [];
        setCampaigns(campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        message.error("Failed to load campaigns.");
      }
    };
  
    fetchCampaigns();
  }, []);
  

  const onFinish = async (values) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          answer: ""
        })
      });

      if (!res.ok) throw new Error("Submission failed");
      message.success("Your question has been submitted!");
      form.resetFields();
      navigate("/support");
    } catch (err) {
      message.error("Failed to submit question.");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "auto" }}>
      <h2>Submit Your Question</h2>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Your Question"
          name="query"
          rules={[{ required: true, message: "Please enter your question" }]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Select type" }]}
        >
          <Select
            options={[
              { label: "Dispute", value: "dispute" },
              { label: "Technical", value: "technical" },
              { label: "Other", value: "other" }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: "Select priority" }]}
        >
          <Select
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Related Campaign (optional)"
          name="campaign_id"
        >
          <Select
            allowClear
            placeholder="Select a campaign"
            options={campaigns.map((c) => ({
              label: c.Title,
              value: c.ID
            }))}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}
