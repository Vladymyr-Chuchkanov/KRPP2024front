// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Snackbar } from '@mui/material';

const Login = () => {
  const { setUser } = useChatContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('jwt')) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`http://0.0.0.0:5000/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Login failed');
        setSnackbarOpen(true);
        return;
      }

      const responseData = await response.json();
      if (responseData.token) {
        // Save the token and set the user
        sessionStorage.setItem('jwt', responseData.token);
        setUser({ email });

        setMessage('Login successful! Redirecting to chat...');
        setSnackbarOpen(true);

        setTimeout(() => {
          setSnackbarOpen(false);
          navigate('/chat');
        }, 500);
      } else {
        setMessage('Invalid response format.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setMessage('An error occurred during login');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box mt={2} width="100%">
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        fullWidth
        sx={{ mt: 2 }}
      >
        Login
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={message}
      />
    </Box>
  );
};

export default Login;
