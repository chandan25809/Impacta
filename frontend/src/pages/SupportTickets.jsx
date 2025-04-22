import { Typography, Collapse, Button, message, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

export default function SupportTickets() {
  const [role, setRole] = useState("guest");
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || "";

  // Decode role and fetch tickets for everyone
  useEffect(() => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setRole(decoded.role);
    } catch {}
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/support-tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTickets(res.data.tickets || []);
    } catch {
      message.error("Failed to fetch support tickets.");
    }
  };

  const handleAnswerSubmit = async (ticketId, answer) => {
    try {
      await axios.put(
        `/api/support-tickets/${ticketId}`,
        { answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      message.success("Answer updated successfully!");
      fetchTickets();
    } catch {
      message.error("Failed to update answer.");
    }
  };

  const handleAskClick = () => {
    navigate("/support/ask");
  };

  const faqs = [
    {
      question: "How can I donate to a campaign?",
      answer:
        "Visit the campaign page and click the 'Donate' button. You can donate using various secure payment methods.",
    },
    {
      question: "Can I edit my campaign after publishing?",
      answer:
        "Yes, you can edit your campaign details from the dashboard as long as it's not marked as completed.",
    },
    {
      question: "Is my payment information safe?",
      answer:
        "Absolutely. We use encrypted payment gateways to ensure your financial data is secure.",
    },
    {
      question: "How do I report a fraudulent campaign?",
      answer:
        "Click the 'Report' button on the campaign page or contact our support team directly.",
    },
    {
      question: "What happens if a campaign doesn't reach its goal?",
      answer:
        "Campaign creators still receive the funds unless otherwise stated. We encourage transparent goal setting.",
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "auto" }}>
      <Title level={2}>Frequently Asked Questions</Title>

      <Collapse accordion>
        {faqs.map((faq, index) => (
          <Panel header={faq.question} key={index}>
            <p>{faq.answer}</p>
          </Panel>
        ))}
      </Collapse>

      {/* Non-admin: My Questions */}
      {role !== "admin" && tickets.length > 0 && (
        <>
          <Title level={3} style={{ marginTop: 60 }}>
            My Questions
          </Title>
          <Collapse accordion>
            {tickets.map((ticket) => (
              <Panel header={ticket.Query} key={ticket.ID}>
                <p>
                  <strong>Answer:</strong>{" "}
                  {ticket.Answer ? ticket.Answer : <em>Pending</em>}
                </p>
              </Panel>
            ))}
          </Collapse>
        </>
      )}

      {/* Admin-only: User Questions */}
      {role === "admin" && (
        <>
          <Title level={3} style={{ marginTop: 60 }}>
            User Questions
          </Title>
          <Collapse accordion>
            {tickets.map((ticket) => (
              <Panel header={ticket.Query} key={ticket.ID}>
                {ticket.Answer ? (
                  <p>
                    <strong>Answer:</strong> {ticket.Answer}
                  </p>
                ) : (
                  <Form
                    onFinish={({ answer }) =>
                      handleAnswerSubmit(ticket.ID, answer)
                    }
                    initialValues={{ answer: "" }}
                  >
                    <Form.Item
                      name="answer"
                      rules={[
                        { required: true, message: "Please enter an answer" },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Enter your answer here..."
                      />
                    </Form.Item>
                    <Button htmlType="submit" type="primary">
                      Submit Answer
                    </Button>
                  </Form>
                )}
              </Panel>
            ))}
          </Collapse>
        </>
      )}

      {/* Ask Now button moved to the bottom */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Title level={4}>Didn't find your question?</Title>
        <Button type="primary" onClick={handleAskClick}>
          Ask Now
        </Button>
      </div>
    </div>
  );
}
