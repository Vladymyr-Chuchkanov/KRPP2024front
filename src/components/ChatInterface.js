import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ChatList, MessageBox } from 'react-chat-elements';
import { Container, TextField, Button, Paper } from '@mui/material';

const API_BASE_URL = 'http://185.206.215.65:5000/api/chats';
const SOCKET_URL = 'http://185.206.215.65:5000';
const TOKEN = sessionStorage.getItem('jwt');

const ChatInterface = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [socket, setSocket] = useState(null);

  const fetchChats = async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('join_chat', { chat_id: chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leave_chat', { chat_id: chatId });
    }
  };

  const sendMessage = () => {
    if (socket && selectedChatId && message.trim()) {
      socket.emit('send_message', {
        chat_id: selectedChatId,
        message: { text: message },
      });
      setMessage('');
    }
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      query: { token: TOKEN },
    });
    setSocket(newSocket);

    newSocket.on('receive_message', (data) => {
      if (data.chat_id === selectedChatId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    newSocket.on('user_joined', (data) => {
      console.log(`${data.nickname} joined the chat.`);
    });

    newSocket.on('user_left', (data) => {
      console.log(`${data.nickname} left the chat.`);
    });

    return () => {
      if (selectedChatId) leaveChat(selectedChatId);
      newSocket.disconnect();
    };
  }, [selectedChatId]);

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Paper elevation={3} style={{ padding: '20px', display: 'flex' }}>
        <div style={{ width: '30%', marginRight: '20px' }}>
          {isLoadingChats ? (
            <p>Loading chats...</p>
          ) : (
            <ChatList
              className="chat-list"
              dataSource={(chats || []).map((chat) => ({
                id: chat.id_chat,
                title: chat.name,
                subtitle: `Created on ${chat.creation_date}`,
              }))}
              onClick={(chat) => {
                if (selectedChatId) leaveChat(selectedChatId);
                setSelectedChatId(chat.id);
                fetchMessages(chat.id);
                joinChat(chat.id);
              }}
            />
          )}
        </div>
        <div style={{ width: '70%' }}>
          <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
            {messages.map((msg) => (
              <div key={msg.id_message} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>
                  {msg.nickname}
                </div>
                <MessageBox
                  position={msg.account_id === selectedChatId ? 'right' : 'left'}
                  type="text"
                  text={msg.text}
                  date={new Date(msg.sent_time)}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="contained" color="primary" onClick={sendMessage} style={{ marginLeft: '10px' }}>
              Send
            </Button>
          </div>
        </div>
      </Paper>
    </Container>
  );
};

export default ChatInterface;
