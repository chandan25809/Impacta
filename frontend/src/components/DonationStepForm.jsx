import React, { useState } from 'react';
import { Button, Form, InputNumber, Select, Input, Typography, Steps, Card } from 'antd';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const DonationStepForm = ({ campaignCurrency, onPaymentApproved, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [donationData, setDonationData] = useState({
    amount: 50,
    currency: campaignCurrency || 'USD',
    message: ''
  });

  const [form] = Form.useForm();

  // Step 1: Handle donation details submission
  const onFinishStepOne = (values) => {
    setDonationData({
      amount: values.amount,
      currency: values.currency,
      message: values.message || ''
    });
    setCurrentStep(1);
  };

  // Step 2: Handle PayPal payment approval
  const handlePaymentApproved = (paymentDetails) => {
    onPaymentApproved({
      paymentDetails,
      donationAmount: donationData.amount,
      donationCurrency: donationData.currency,
      donationMessage: donationData.message
    });
  };

  // Step 1 content: donation details form
  const StepOneContent = (
    <Card>
      <Title level={4}>Enter Donation Details</Title>
      <Form
        layout="vertical"
        form={form}
        initialValues={donationData}
        onFinish={onFinishStepOne}
      >
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: 'Please enter your donation amount' }]}
        >
          <InputNumber min={1} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Currency"
          name="currency"
          rules={[{ required: true, message: 'Please select a currency' }]}
        >
          <Select style={{ width: '100%' }}>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
            {/* Add more currencies if needed */}
          </Select>
        </Form.Item>
        <Form.Item label="Donation Message (optional)" name="message">
          <TextArea rows={3} placeholder="Enter a message (optional)..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Next
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 2 content: review and PayPal checkout
  const StepTwoContent = (
    <Card>
      <Title level={4}>Review & Pay</Title>
      <Paragraph>
        <strong>Amount:</strong> {donationData.amount} <br />
        <strong>Currency:</strong> {donationData.currency} <br />
        <strong>Message:</strong> {donationData.message || 'No message provided'}
      </Paragraph>
      <PayPalScriptProvider
        options={{
          'client-id': 'AROa3y8alygffSNjRAJOlTiXQs48wGs2PUKX66RnjG_FuL7kRE4xkqSqPQQjVGlh7OGdoopWsKHbUJxe', // Replace with your actual PayPal client ID
          currency: donationData.currency
        }}
      >
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={(data, actions) => {
            console.log('Creating PayPal order with:', donationData);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: donationData.amount.toString(),
                    currency_code: donationData.currency
                  }
                }
              ],
              application_context: {
                shipping_preference: 'NO_SHIPPING'
              }
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              handlePaymentApproved(details);
            });
          }}
        />
      </PayPalScriptProvider>
      <Button style={{ marginTop: 16 }} onClick={() => setCurrentStep(0)}>
        Back
      </Button>
    </Card>
  );

  return (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Donation Info" />
        <Step title="Review & Pay" />
      </Steps>
      {currentStep === 0 ? StepOneContent : StepTwoContent}
      <Button style={{ marginTop: 16 }} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

export default DonationStepForm;
