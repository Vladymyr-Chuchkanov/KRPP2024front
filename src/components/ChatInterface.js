// src/components/ChatInterface.js
import React from 'react';
import { ChatList, MessageBox } from 'react-chat-elements';
import { Container, TextField, Button, Paper } from '@mui/material';

const ChatInterface = () => {
  const [message, setMessage] = React.useState('');

  const handleSendMessage = () => {
    console.log("Message sent:", message);
    setMessage('');
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <h2>Chat Room</h2>

        <ChatList
          className="chat-list"
          dataSource={[
            { avatar: 'https://via.placeholder.com/40', title: 'User 1', subtitle: 'Hello!', date: new Date() },
            { avatar: 'https://via.placeholder.com/40', title: 'User 2', subtitle: 'Hi there!', date: new Date() },
          ]}
        />

        <div style={{ marginTop: '20px', height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
          <MessageBox position={'left'} type={'text'} text={'Hello, how are you?'} date={new Date()} />
          <MessageBox position={'right'} type={'text'} text={'I am fine, thank you!'} date={new Date()} />
        </div>

        <div style={{ display: 'flex', marginTop: '10px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} style={{ marginLeft: '10px' }}>
            Send
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default ChatInterface;
