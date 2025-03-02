import React, { useState, createElement } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // For Ant Design v5

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/** 
 * A custom comment component that mimics the removed antd Comment
 * component, including like/dislike actions.
 */
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

const GoFundMeLikePage = () => {
  // -----------------------
  // Dummy donation data
  // -----------------------
  const totalRaised = 2080;
  const goal = 10000;
  const totalDonations = 32; // e.g., total donation count
  const progressPercentage = Math.round((totalRaised / goal) * 100);

  // -----------------------
  // Dummy donors
  // -----------------------
  const donors = [
    { id: uuidv4(), name: 'Jean Durico', amount: 100 },
    { id: uuidv4(), name: 'Rose Cortez', amount: 50 },
    { id: uuidv4(), name: 'Anonymous', amount: 200 },
    { id: uuidv4(), name: 'Betty Jo Nash', amount: 30 },
    // ... Add more donors if you want a longer list
  ];

  // -----------------------
  // Comments State
  // -----------------------
  const [comments, setComments] = useState([
    {
      id: uuidv4(),
      author: 'John Doe',
      avatar: 'https://joeschmoe.io/api/v1/random',
      content: "Great cause! I'm happy to support this campaign.",
      createdAt: new Date().toLocaleString(),
    },
    {
      id: uuidv4(),
      author: 'Jane Smith',
      avatar: 'https://joeschmoe.io/api/v1/random',
      content: 'Amazing initiative. Best of luck!',
      createdAt: new Date().toLocaleString(),
    },
  ]);

  const [commentForm] = Form.useForm();

  // -----------------------
  // Handle comment submission
  // -----------------------
  const onFinishComment = (values) => {
    const newComment = {
      id: uuidv4(),
      author: 'User', // In a real app, replace with the logged-in user's name
      avatar: 'https://joeschmoe.io/api/v1/random',
      content: values.comment,
      createdAt: new Date().toLocaleString(),
    };
    setComments([...comments, newComment]);
    commentForm.resetFields();
    AntMessage.success('Comment added!');
  };

  // -----------------------
  // Modal state for "See all" donations
  // -----------------------
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showAllDonations = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, background: "white" }}>
      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN */}
        <Col xs={24} md={16}>
          {/* Main Campaign Card */}
          <Card
            bordered={false}
            cover={
              <img
                alt="Campaign Banner"
                src="https://images.gofundme.com/FRTOEsRb4VcJ5RDwaspV9bOGPMc=/720x405/https://d2g8igdw686xgo.cloudfront.net/74883377_1692651226905050_r.jpeg"
                style={{ objectFit: 'cover' }}
              />
            }
            style={{ marginBottom: 24 }}
          >
            <Title level={3}>Celebrate Heather Jennings' Life and Legacy</Title>
            <Paragraph>
              My mother, Heather Jennings, was an incredible person who dedicated her life to
              serving the community. On December 3rd 2024, a disastrous event took her away
              from us too soon. In honor of her memory and her passion for helping others, we
              have created this fund to continue her legacy.
            </Paragraph>
            <Paragraph>
              Heather was known for her kindness, compassion, and dedication to bringing people
              together. She loved volunteering at the local radio station, organizing community
              events, and inspiring others to be their best. Please join us in celebrating her
              life by contributing to a cause that meant so much to her.
            </Paragraph>
            <Paragraph>
              All funds raised will go toward supporting local radio programming, community
              outreach, and a scholarship in Heather's name. Any amount is appreciated, and we
              thank you for your generosity and support.
            </Paragraph>
          </Card>

          {/* Organizer and Beneficiary Section */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Organizer and beneficiary</Title>
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Avatar
                size={48}
                src="https://joeschmoe.io/api/v1/jane"
                style={{ marginRight: 16 }}
              />
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
              <Avatar
                size={48}
                src="https://joeschmoe.io/api/v1/random"
                style={{ marginRight: 16 }}
              />
              <div>
                <Text strong>Joey Jennings</Text>
                <br />
                <Text type="secondary">Beneficiary</Text>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
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

            {/* Add a Comment */}
            <Card type="inner" title="Add a Comment" style={{ marginTop: '20px' }}>
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

        {/* RIGHT COLUMN */}
        <Col xs={24} md={8}>
          {/* Donation Summary */}
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
                '100%': '#87d068',
              }}
              style={{ marginTop: 8 }}
            />

            <div style={{ marginTop: 16 }}>
              <Button type="primary" block style={{ marginBottom: 8 }}>
                Donate now
              </Button>
              <Button type="primary" block>Share</Button>
            </div>
          </Card>

          {/* Recent Donations */}
          <Card
            title="Recent donations"
            extra={
              <Button type="primary" onClick={showAllDonations}>
                See all
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={donors.slice(0, 3)} // Show only the first 3 for "recent"
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

      {/* MODAL: Full Donations List */}
      <Modal
        title={`Donations (${donors.length})`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <List
          itemLayout="horizontal"
          dataSource={donors}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
          renderItem={(donor) => (
            <List.Item key={donor.id}>
              <List.Item.Meta
                avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                title={
                  <Text strong>
                    {donor.name} donated ${donor.amount}
                  </Text>
                }
                description="3 days ago"
              />
            </List.Item>
          )}
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => AntMessage.info('Redirect to donation flow')}>
            Donate now
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GoFundMeLikePage;
