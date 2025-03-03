import React, { useState } from 'react';
import { Modal, Form, InputNumber, Select, Input } from 'antd';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const { Option } = Select;
const { TextArea } = Input;

const PaypalPaymentModal = ({
  visible,
  onCancel,
  onPaymentApproved
}) => {
  // Local state for user-entered amount, currency, and message
  const [amount, setAmount] = useState(50);       // Default 50
  const [currency, setCurrency] = useState('USD'); // Default USD
  const [donationMessage, setDonationMessage] = useState('');

  return (
    <Modal
      title="Pay with PayPal"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      {/* Form to let user set donation amount, currency, and an optional message */}
      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label="Donation Amount">
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            step={0.01}
            value={amount}
            onChange={(val) => {
              console.log("Donation amount changed:", val);
              setAmount(val);
            }}
          />
        </Form.Item>

        <Form.Item label="Currency">
          <Select
            value={currency}
            onChange={(val) => setCurrency(val)}
            style={{ width: '100%' }}
          >
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
            {/* Add more currencies as needed */}
          </Select>
        </Form.Item>

        <Form.Item label="Donation Message (optional)">
          <TextArea
            rows={3}
            value={donationMessage}
            onChange={(e) => setDonationMessage(e.target.value)}
            placeholder="Enter a message to accompany your donation"
          />
        </Form.Item>
      </Form>

      <PayPalScriptProvider
        options={{
          'client-id': 'AROa3y8alygffSNjRAJOlTiXQs48wGs2PUKX66RnjG_FuL7kRE4xkqSqPQQjVGlh7OGdoopWsKHbUJxe', // Replace with your actual PayPal client ID
          currency: currency
        }}
      >
        <PayPalButtons
          style={{ layout: 'vertical' }}
          createOrder={(data, actions) => {
            console.log("Creating PayPal order with amount:", amount, "currency:", currency);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: currency
                  }
                }
              ],
              application_context: {
                // Disable address collection
                shipping_preference: 'NO_SHIPPING'
              }
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              // Pass payment details + user-chosen amount, currency, and message back to parent
              onPaymentApproved({
                paymentDetails: details,
                donationAmount: amount,
                donationCurrency: currency,
                donationMessage
              });
            });
          }}
        />
      </PayPalScriptProvider>
    </Modal>
  );
};

export default PaypalPaymentModal;
