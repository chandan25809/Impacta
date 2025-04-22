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
  Modal,
  Space
} from 'antd';
import {
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
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
          <span style={{ marginLeft: 4 }}>{likes}</span>
        </span>
      </Tooltip>
      <Tooltip title="Dislike">
        <span onClick={dislike} style={{ cursor: 'pointer', marginRight: 16 }}>
          {createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
          <span style={{ marginLeft: 4 }}>{dislikes}</span>
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
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [commentForm] = Form.useForm();

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const { data: { campaign } } = await axios.get(`/api/campaigns/detail/${campaignId}`);
        setCampaign(campaign);

        const { data: media } = await axios.get(`/api/campaigns/${campaignId}/mediafiles`);
        setMediaFiles(media);

        const { data: commentsRes } = await axios.get(`/api/campaigns/${campaignId}/comments`);
        setComments(
          commentsRes.comments.map(c => ({
            id: c.ID,
            author: c.User.FullName,
            avatar: 'https://joeschmoe.io/api/v1/random',
            content: c.Content,
            createdAt: new Date(c.CreatedAt).toLocaleString(),
          }))
        );

        const { data: donationsRes } = await axios.get(`/api/campaigns/detail/${campaignId}/donations`);
        setDonations(
          donationsRes.donations.map(d => ({
            id: d.ID,
            name: d.Donor.FullName,
            amount: d.Amount,
            createdAt: new Date(d.CreatedAt).toLocaleString(),
          }))
        );
      } catch (err) {
        console.error(err);
        AntMessage.error('Failed to load campaign data.');
      }
    };

    if (campaignId) fetchCampaignData();
  }, [campaignId]);

  const onFinishComment = async ({ comment }) => {
    try {
      await axios.post('/api/comments', {
        CampaignID: campaignId,
        UserID: 'dummy-user-id',
        Content: comment,
      });
      AntMessage.success('Comment added!');
      commentForm.resetFields();
      setComments(prev => [
        ...prev,
        {
          id: uuidv4(),
          author: 'User',
          avatar: 'https://joeschmoe.io/api/v1/random',
          content: comment,
          createdAt: new Date().toLocaleString(),
        }
      ]);
    } catch {
      AntMessage.error('Failed to add comment.');
    }
  };

  const handlePaymentApproved = async ({ paymentDetails, donationAmount, donationCurrency, donationMessage }) => {
    const { payer } = paymentDetails;
    const donorEmail = payer.email_address;
    const donorFullName = `${payer.name.given_name} ${payer.name.surname}`;

    try {
      await axios.post('/api/register', {
        email: donorEmail,
        full_name: donorFullName,
        role: 'donor'
      });
      await axios.post('/api/donations', {
        campaign_id: campaignId,
        donor_name: donorFullName,
        email: donorEmail,
        amount: donationAmount,
        currency: donationCurrency,
        message: donationMessage || 'Supporting the cause!',
        is_anonymous: false
      });
      AntMessage.success('Donation recorded successfully!');
    } catch {
      AntMessage.error('Failed to record donation.');
    }
    setIsStepModalVisible(false);
  };

  const totalRaised = campaign?.CurrentAmount || 0;
  const goal = campaign?.TargetAmount || 0;
  const progress = goal > 0 ? Math.round((totalRaised / goal) * 100) : 0;
  const shareUrl = window.location.href;
  const shareText = campaign ? `${campaign.Title} – ${shareUrl}` : shareUrl;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    AntMessage.success('Link copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, background: 'white' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          {/* Campaign header */}
          <Card
            bordered={false}
            cover={
              <img
                alt="Campaign Banner"
                src={
                  mediaFiles.find(m => m.FileType === 'banner')?.URL ||
                  'https://via.placeholder.com/900x400.png?text=Campaign+Banner'
                }
                style={{ objectFit: 'cover' }}
              />
            }
            style={{ marginBottom: 24 }}
          >
            <Title level={3}>{campaign?.Title || 'Loading campaign...'}</Title>
            <Paragraph>{campaign?.Description}</Paragraph>
          </Card>

          {/* Organizer & beneficiary */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Organizer and beneficiary</Title>
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Avatar size={48} src="https://joeschmoe.io/api/v1/jane" style={{ marginRight: 16 }} />
              <div>
                <Text strong>Dixie Jennings</Text><br/>
                <Text type="secondary">Organizer</Text><br/>
                <Text type="secondary">Gainesville, FL</Text>
              </div>
            </div>
            <Divider />
            <div style={{ display: 'flex' }}>
              <Avatar size={48} src="https://joeschmoe.io/api/v1/random" style={{ marginRight: 16 }} />
              <div>
                <Text strong>Joey Jennings</Text><br/>
                <Text type="secondary">Beneficiary</Text>
              </div>
            </div>
          </Card>

          {/* Comments */}
          <Card title="Comments">
            <List
              dataSource={comments}
              itemLayout="vertical"
              renderItem={item => (
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
                  <Button type="primary" htmlType="submit">Submit Comment</Button>
                </Form.Item>
              </Form>
            </Card>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Stats & share */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              ${totalRaised.toLocaleString()} raised
            </Title>
            <Text type="secondary">
              ${goal.toLocaleString()} target • {donations.length} donations
            </Text>
            <Progress percent={progress} showInfo={false} strokeColor={{ '0%':'#108ee9','100%':'#87d068' }} style={{ marginTop: 8 }} />

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                block
                onClick={() => setIsStepModalVisible(true)}
                style={{ marginBottom: 8 }}
              >
                Donate now
              </Button>

              <Button
                type="primary"
                block
                onClick={() => setShowShareOptions(prev => !prev)}
              >
                Share
              </Button>

              {showShareOptions && (
                <Space size="large" style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}>
                  <Tooltip title="WhatsApp">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppOutlined style={{ fontSize: 24 }} />
                    </a>
                  </Tooltip>

                  <Tooltip title="Twitter">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TwitterOutlined style={{ fontSize: 24 }} />
                    </a>
                  </Tooltip>

                  <Tooltip title="Copy link">
                    <LinkOutlined
                      onClick={copyLink}
                      style={{ fontSize: 24, cursor: 'pointer' }}
                    />
                  </Tooltip>

                  <Tooltip title="Instagram">
                    <a
                      href={`https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramOutlined style={{ fontSize: 24 }} />
                    </a>
                  </Tooltip>
                </Space>
              )}
            </div>
          </Card>

          {/* Recent donations */}
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
              renderItem={d => (
                <List.Item key={d.id}>
                  <List.Item.Meta
                    avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                    title={<Text strong>{d.name} donated ${d.amount}</Text>}
                    description={new Date(d.createdAt).toLocaleDateString()}
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
          campaignCurrency={campaign?.Currency || 'USD'}
          onPaymentApproved={handlePaymentApproved}
          onCancel={() => setIsStepModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default DonationPage;
