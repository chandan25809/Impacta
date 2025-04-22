import React from "react";
import { Typography, Layout } from "antd";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

export default function Terms() {
  return (
    <Layout style={{ minHeight: "100vh", padding: "40px 20px", background: "#fff" }}>
      <Content style={{ maxWidth: 800, margin: "auto" }}>
        <Typography>
          <Title level={2}>Terms & Policies</Title>

          <Paragraph>
            Welcome to Impacta! By using this platform, you agree to comply with our terms of service and privacy policies.
          </Paragraph>

          <Title level={4}>1. User Responsibilities</Title>
          <Paragraph>
            Users must provide accurate information when registering or creating campaigns. Any misuse of the platform will lead to suspension.
          </Paragraph>

          <Title level={4}>2. Campaign Guidelines</Title>
          <Paragraph>
            All campaigns must adhere to our ethical standards. We reserve the right to remove campaigns that violate legal or community guidelines.
          </Paragraph>

          <Title level={4}>3. Donation Handling</Title>
          <Paragraph>
            Donations are securely processed. Impacta is not responsible for misuse of funds by campaign creators, but we will investigate all reported issues.
          </Paragraph>

          <Title level={4}>4. Privacy Policy</Title>
          <Paragraph>
            We respect your privacy. User data is encrypted and will never be sold or shared without consent.
          </Paragraph>

          <Title level={4}>5. Changes to Terms</Title>
          <Paragraph>
            These terms may be updated at any time. Continued use of the platform constitutes acceptance of updated terms.
          </Paragraph>

          <Paragraph>
            For any concerns, please <a href="/support">contact us</a> via our support page.
          </Paragraph>
        </Typography>
      </Content>
    </Layout>
  );
}
