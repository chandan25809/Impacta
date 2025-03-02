import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../pages/Register.module.css"; // ✅ Correct CSS Module Import

const { Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    console.log("📌 Register Form Submitted:", values);

    try {
      console.log("🚀 Sending registration request to API...");
      
      const response = await axios.post(
        "/api/register", // Using Vite Proxy
        values,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", response);

      if (response.status === 201) {
        message.success("Registration successful! Redirecting to login...");
        console.log("🔄 Redirecting to /login in 2 seconds...");
        
        setTimeout(() => navigate("/login"), 2000);
      } else {
        message.error("Unexpected response from server.");
        console.error("⚠️ Unexpected API Response:", response);
      }
    } catch (error) {
      message.error("Registration failed. Please try again.");
      
      if (error.response) {
        console.error("❌ API Error Response:", error.response);
      } else if (error.request) {
        console.error("⚠️ No Response from API:", error.request);
      } else {
        console.error("🚨 Error in request setup:", error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className={styles["register-container"]}>
      <Card className={styles["register-card"]} title={<span style={{ fontSize: "24px", fontWeight: "bold" }}>Register</span>}>
        <Form name="register" layout="vertical" onFinish={onFinish}>
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input className={styles["register-input"]} placeholder="Enter your full name" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input className={styles["register-input"]} placeholder="Enter your email" />
          </Form.Item>

          {/* Password with Strong Validation */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 8, message: "Password must be at least 8 characters long" },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Password must contain at least one uppercase letter, one number, and one special character",
              },
            ]}
          >
            <Input.Password className={styles["register-input"]} placeholder="Enter a strong password" />
          </Form.Item>

          {/* Re-enter Password Validation */}
          <Form.Item
            label="Re-enter Password"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please re-enter your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password className={styles["register-input"]} placeholder="Re-enter your password" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button className={styles["register-button"]} type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>

        {/* Already a user? Login */}
        <div className={styles["register-link"]}>
          <Text>
            Already a user?{" "}
            <Typography.Link>
              <Link to="/login">Login</Link>
            </Typography.Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
