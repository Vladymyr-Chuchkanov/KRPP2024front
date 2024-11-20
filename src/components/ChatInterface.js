import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { ChatList, MessageBox } from 'react-chat-elements';
import { Container, TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import 'react-chat-elements/dist/main.css';

const API_BASE_URL = 'http://185.206.215.65:5000/api/chats';
const SOCKET_URL = 'http://185.206.215.65:5000';
const TOKEN = sessionStorage.getItem('jwt');

const ChatInterface = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  // Refs to hold the latest values
  const selectedChatIdRef = useRef(selectedChatId);
  const messagesRef = useRef(messages);

  const handleUnauthorized = () => {
    sessionStorage.removeItem('jwt');
    navigate('/login');
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createChat = async () => {
    try {
      const chatName = prompt('Enter a name for the chat:');
      if (!chatName) return;

      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: chatName }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 201) {
        console.log('Chat created successfully.');
        fetchChats();
      } else {
        console.error('Failed to create chat.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('jwt');
    navigate('/login');
  };

  const joinChat = (chatId, chatName) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
  };

  const sendMessage = () => {
    if (socket && selectedChatId && message.trim()) {
      socket.emit('send_message', {
        chat_id: selectedChatId,
        message: message,
      });
      setMessage('');
    }
  };

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      query: { token: TOKEN },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleChatCreated = () => {
        fetchChats();
      };

      const handleChatUpdated = () => {
        fetchChats();
      };

      const handleReceiveMessage = (data) => {
        console.log(data)
        if (data.chat_id === selectedChatIdRef.current) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id_message: Date.now(),
              text: data.message,
              account: { nickname: data.username },
            }
          ]);
        }
        };

        const handleUserJoined = (data) => {
          setTimeout(function(){
            if (data.chat_id === selectedChatIdRef.current) {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  id_message: Date.now(),
                  text: `${data.username} joined the chat.`,
                  account: { nickname: 'System' },
                },
              ]);
            }
          }, 2000)
        };

        const handleUserLeft = (data) => {
          setTimeout(function(){}, 5000)
          if (data.chat_id === selectedChatIdRef.current) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id_message: Date.now(),
                text: `${data.username} left the chat.`,
                account: { nickname: 'System' },
              },
            ]);
          }
        };

        socket.on('chat_created', handleChatCreated);
        socket.on('chat_updated', handleChatUpdated);
        socket.on('receive_message', handleReceiveMessage);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);

        return () => {
          socket.off('chat_created', handleChatCreated);
          socket.off('chat_updated', handleChatUpdated);
          socket.off('receive_message', handleReceiveMessage);
          socket.off('user_joined', handleUserJoined);
          socket.off('user_left', handleUserLeft);
        };
      }
    }, [socket]);

    useEffect(() => {
      if (socket) {
        if (selectedChatIdRef.current) {
          socket.emit('leave_chat', { chat_id: selectedChatIdRef.current });
        }

        if (selectedChatId) {
          socket.emit('join_chat', { chat_id: selectedChatId });
          fetchMessages(selectedChatId);
        } else {
          setMessages([]);
        }

        selectedChatIdRef.current = selectedChatId;
      }
    }, [selectedChatId, socket]);

    useEffect(() => {
      fetchChats();
    }, []);

    return (
      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <Paper elevation={3} style={{ padding: '20px', display: 'flex' }}>
          <div style={{ width: '30%', marginRight: '20px' }}>
            <Button
              variant="contained"
              color="primary"
              style={{ marginBottom: '10px', width: "100%" }}
              onClick={createChat}
            >
              Create Chat
            </Button>
            <ChatList
              className="chat-list"
              dataSource={(chats || []).map((chat) => ({
                id: chat.id_chat,
                key: chat.id_chat,
                title: chat.name,
                avatar: `https://ui-avatars.com/api/?name=${chat.name.charAt(0).toUpperCase()}&size=128&background=random`,
                date: chat.creation_date,
                subtitle: `Created on ${chat.creation_date}`,
              }))}
              onClick={(chat) => {
                joinChat(chat.id, chat.title);
              }}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginBottom: '10px', width: "100%" }}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
          <div style={{ width: '70%' }}>
            {!selectedChatId ? (
              <Typography variant="h6" color="textSecondary">
                Select a chat to view messages
              </Typography>
            ) : (
              <>
                <Typography variant="h6">{selectedChatName}</Typography>
                <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                  {messages.map((msg) => (
                    <div key={msg.id_message} style={{ marginBottom: '10px' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: '#555',
                        marginBottom: '5px',
                        float: 'left',
                        marginRight: '10px',
                      }}
                    >
                      {(msg.account && msg.account.nickname) || 'Unknown'}:
                    </span>
                      <MessageBox
                        position={msg.account && msg.account.nickname === 'System' ? 'center' : 'left'}
                        type="text"
                        text={msg.text || ''}
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendMessage}
                    style={{ marginLeft: '10px' }}
                  >
                    Send
                  </Button>
                </div>
              </>
            )}
          </div>
        </Paper>
      </Container>
    );
  };

  export default ChatInterface;
