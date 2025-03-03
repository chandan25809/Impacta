import React, { useState, useEffect, createElement } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Progress,
  List,
  Avatar,
  Typography,
  Divider,
  Form,
  Input,
  message as AntMessage,
  Tooltip,
  Modal
} from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import DonationStepForm from '../components/DonationStepForm';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const DonationComment = ({ author, avatar, content, datetime }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState(null);

  const like = () => {
    setLikes(1);
    setDislikes(0);
    setAction('liked');
  };

  const dislike = () => {
    setLikes(0);
    setDislikes(1);
    setAction('disliked');
  };

  const actions = (
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Like">
        <span onClick={like} style={{ cursor: 'pointer', marginRight: 16 }}>
          {createElement(action === 'liked' ? LikeFilled : LikeOutlined)}
          <span className="comment-action" style={{ marginLeft: 4 }}>
            {likes}
          </span>
        </span>
      </Tooltip>
      <Tooltip title="Dislike">
        <span onClick={dislike} style={{ cursor: 'pointer', marginRight: 16 }}>
          {createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
          <span className="comment-action" style={{ marginLeft: 4 }}>
            {dislikes}
          </span>
        </span>
      </Tooltip>
      <span style={{ color: '#1890ff', cursor: 'pointer' }}>Reply to</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', marginBottom: 16 }}>
      <Avatar src={avatar} alt={author} />
      <div style={{ marginLeft: 16, flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{author}</div>
        <div style={{ marginTop: 4 }}>{content}</div>
        {actions}
        <Tooltip title={datetime}>
          <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>{datetime}</div>
        </Tooltip>
      </div>
    </div>
  );
};

const DonationPage = () => {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [donations, setDonations] = useState([]);
  const [comments, setComments] = useState([]);
  const [isStepModalVisible, setIsStepModalVisible] = useState(false);

  const [commentForm] = Form.useForm();

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const campaignRes = await axios.get(`/api/campaigns/detail/${campaignId}`);
        console.log("Campaign data",campaignRes)
        setCampaign(campaignRes.data.campaign);

        const mediaRes = await axios.get(`/api/campaigns/${campaignId}/mediafiles`);
        setMediaFiles(mediaRes.data);

        const commentsRes = await axios.get(`/api/campaigns/${campaignId}/comments`);
        console.log("comments",commentsRes)
        setComments(
          commentsRes.data.comments.map(comment => ({
            id: comment.ID,
            author: comment.User.FullName,
            avatar: 'https://joeschmoe.io/api/v1/random',
            content: comment.Content,
            createdAt: new Date(comment.CreatedAt).toLocaleString(),
          }))
        );

        const donationsRes = await axios.get(`/api/campaigns/detail/${campaignId}/donations`);
        setDonations(
          donationsRes.data.donations.map(donation => ({
            id: donation.ID,
            name: donation.Donor.FullName,
            amount: donation.Amount,
            createdAt: new Date(donation.CreatedAt).toLocaleString(),
          }))
        );
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        AntMessage.error('Failed to load campaign data.');
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const onFinishComment = async (values) => {
    try {
      const commentData = {
        CampaignID: campaignId,
        UserID: 'dummy-user-id',
        Content: values.comment,
      };
      await axios.post(
        `/api/campaigns/${campaignId}/comments`,
        commentData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      AntMessage.success('Comment added!');
      commentForm.resetFields();
      setComments(prev => [
        ...prev,
        {
          id: uuidv4(),
          author: 'User',
          avatar: 'https://joeschmoe.io/api/v1/random',
          content: commentData.Content,
          createdAt: new Date().toLocaleString(),
        }
      ]);
    } catch (error) {
      console.error('Comment submission error:', error);
      AntMessage.error('Failed to add comment.');
    }
  };

  const handlePaymentApproved = async ({
    paymentDetails,
    donationAmount,
    donationCurrency,
    donationMessage
  }) => {
    console.log('Payment successful:', paymentDetails);
    const { payer } = paymentDetails;
    const donorEmail = payer.email_address;
    const donorFullName = `${payer.name.given_name} ${payer.name.surname}`;

    try {
      await axios.post(
        '/api/register',
        {
          email: donorEmail,
          full_name: donorFullName,
          role: 'donor'
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      await axios.post(
        '/api/donations',
        {
          campaign_id: campaignId,
          donor_name: donorFullName,
          email: donorEmail,
          amount: donationAmount,
          currency: donationCurrency,
          message: donationMessage || 'Supporting the cause!',
          is_anonymous: false
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      AntMessage.success('Donation recorded successfully!');
    } catch (error) {
      console.error('Error recording donation:', error);
      AntMessage.error('Failed to record donation.');
    }
    setIsStepModalVisible(false);
  };

  const totalRaised = campaign ? campaign.CurrentAmount : 0;
  const goal = campaign ? campaign.TargetAmount : 0;
  const progressPercentage = goal > 0 ? Math.round((totalRaised / goal) * 100) : 0;
  const totalDonations = donations.length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, background: 'white' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            cover={
              <img
                alt="Campaign Banner"
                src={
                  mediaFiles.find(file => file.FileType === 'banner')
                    ? mediaFiles.find(file => file.FileType === 'banner').URL
                    : 'https://via.placeholder.com/900x400.png?text=Campaign+Banner'
                }
                style={{ objectFit: 'cover' }}
              />
            }
            style={{ marginBottom: 24 }}
          >
            <Title level={3}>{campaign ? campaign.Title : 'Loading campaign...'}</Title>
            <Paragraph>{campaign ? campaign.Description : ''}</Paragraph>
          </Card>
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Organizer and beneficiary</Title>
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Avatar size={48} src="https://joeschmoe.io/api/v1/jane" style={{ marginRight: 16 }} />
              <div>
                <Text strong>Dixie Jennings</Text>
                <br />
                <Text type="secondary">Organizer</Text>
                <br />
                <Text type="secondary">Gainesville, FL</Text>
              </div>
            </div>
            <Divider />
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Avatar size={48} src="https://joeschmoe.io/api/v1/random" style={{ marginRight: 16 }} />
              <div>
                <Text strong>Joey Jennings</Text>
                <br />
                <Text type="secondary">Beneficiary</Text>
              </div>
            </div>
          </Card>
          <Card title="Comments">
            <List
              dataSource={comments}
              itemLayout="vertical"
              renderItem={(item) => (
                <DonationComment
                  key={item.id}
                  author={item.author}
                  avatar={item.avatar}
                  content={item.content}
                  datetime={item.createdAt}
                />
              )}
              locale={{ emptyText: 'No comments yet. Be the first to comment!' }}
            />
            <Card type="inner" title="Add a Comment" style={{ marginTop: 20 }}>
              <Form form={commentForm} layout="vertical" onFinish={onFinishComment}>
                <Form.Item
                  name="comment"
                  rules={[{ required: true, message: 'Please enter your comment!' }]}
                >
                  <TextArea rows={4} placeholder="Write your comment here..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Submit Comment
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              ${totalRaised.toLocaleString()} raised
            </Title>
            <Text type="secondary">
              ${goal.toLocaleString()} target • {totalDonations} donations
            </Text>
            <Progress
              percent={progressPercentage}
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068'
              }}
              style={{ marginTop: 8 }}
            />
            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                block
                onClick={() => setIsStepModalVisible(true)}
                style={{ marginBottom: 8 }}
              >
                Donate now
              </Button>
              <Button type="primary" block>
                Share
              </Button>
            </div>
          </Card>
          <Card
            title="Recent donations"
            extra={
              <Button type="primary" onClick={() => setIsStepModalVisible(true)}>
                See all
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={donations.slice(0, 3)}
              renderItem={(donor) => (
                <List.Item key={donor.id}>
                  <List.Item.Meta
                    avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                    title={
                      <Text strong>
                        {donor.name} donated ${donor.amount}
                      </Text>
                    }
                    description="1 day ago"
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Donations"
        open={isStepModalVisible}
        onCancel={() => setIsStepModalVisible(false)}
        footer={null}
        width={600}
      >
        <DonationStepForm
          campaignCurrency={campaign ? campaign.Currency : 'USD'}
          onPaymentApproved={handlePaymentApproved}
          onCancel={() => setIsStepModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default DonationPage;
