import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../pages/Register.css"; // Import the styles

const { Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const onFinish = async (values) => {
    setLoading(true);
    console.log("📌 Register Form Submitted:", values); // Debug log: Form data

    try {
      console.log("🚀 Sending registration request to API...");
      
      const response = await axios.post(
        "/api/register", // Ensure Vite Proxy is configured
        values,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", response);

      if (response.status === 201) {
        message.success("Registration successful! Redirecting to login...");
        console.log("🔄 Redirecting to /login in 2 seconds...");
        
        // Redirect to Login Page after 2 seconds
        setTimeout(() => navigate("/login"), 2000);
      } else {
        message.error("Unexpected response from server.");
        console.error("⚠️ Unexpected API Response:", response);
      }
    } catch (error) {
      message.error("Registration failed. Please try again.");
      
      if (error.response) {
        // Server responded with a status other than 200
        console.error("❌ API Error Response:", error.response);
      } else if (error.request) {
        // Request was made but no response received
        console.error("⚠️ No Response from API:", error.request);
      } else {
        // Other errors
        console.error("🚨 Error in request setup:", error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <Card className="register-card" title={<span style={{ fontSize: "24px", fontWeight: "bold" }}>Register</span>}>
        <Form name="register" layout="vertical" onFinish={onFinish}>
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input placeholder="Enter your full name" />
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
            <Input placeholder="Enter your email" />
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
            <Input.Password className="custom-password" placeholder="Enter a strong password" />
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
            <Input.Password className="custom-password" placeholder="Re-enter your password" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button className="register-button" type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>

        {/* Already a user? Login */}
        <div className="register-link">
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
