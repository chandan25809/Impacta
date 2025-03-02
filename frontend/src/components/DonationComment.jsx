import React, { createElement, useState } from 'react';
import { Avatar, Tooltip } from 'antd';
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons';

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
          <span className="comment-action">{likes}</span>
        </span>
      </Tooltip>
      <Tooltip title="Dislike">
        <span onClick={dislike} style={{ cursor: 'pointer', marginRight: 16 }}>
          {createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
          <span className="comment-action">{dislikes}</span>
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

export default DonationComment;
