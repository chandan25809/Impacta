import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../pages/Login.module.css"; // ✅ Import CSS Module

const { Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    console.log("📌 Form Submitted:", values);
  
    try {
      console.log("🚀 Sending login request to API...");
  
      const response = await axios.post(
        "/api/login",
        values,
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("✅ API Response:", response);
  
      if (response.status === 200 || response.status === 201) {
        const { token } = response.data; // Extract token from response

        // ✅ Store token in localStorage
        localStorage.setItem("token", token);
        console.log("🔑 Token stored in localStorage:", token)
        message.success("Login successful! Redirecting to dashboard...");
        console.log("🔄 Redirecting to /analyticsdashboard...");
        setTimeout(() => navigate("/analyticsdashboard"), 1000);
      } else {
        message.error("Unexpected response from server.");
        console.error("⚠️ Unexpected API Response:", response);
      }
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
      
      if (error.response) {
        console.error("❌ API Error Response:", error.response);
        console.log("❗ Status:", error.response.status);
        console.log("❗ Data:", error.response.data);
      } else if (error.request) {
        console.error("⚠️ No Response from API:", error.request);
      } else {
        console.error("🚨 Error in request setup:", error.message);
      }
    }
  
    setLoading(false);
  };
  

  return (
    <div className={styles["login-container"]}> {/* ✅ Use CSS Module class */}
      <Card className={styles["login-card"]} title={<span style={{ fontSize: "26px", fontWeight: "bold" }}>Welcome Back</span>}>
        <Form name="login" layout="vertical" onFinish={onFinish}>
          
          {/* Email */}
          <Form.Item
            label="Enter Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input className={styles["login-input"]} placeholder="Enter email" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Enter Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password className={styles["login-input"]} placeholder="Enter password" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button className={styles["login-button"]} type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>

        {/* New User? Register */}
        <div className={styles["login-link"]}>
          <Text style={{ fontSize: "16px" }}>
            New user?{" "}
            <Typography.Link>
              <Link to="/register">Register</Link>
            </Typography.Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;