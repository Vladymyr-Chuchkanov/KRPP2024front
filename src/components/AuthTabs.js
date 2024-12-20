// src/components/AuthTabs.js
import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Box, Typography, Snackbar } from '@mui/material';
import Register from './Register';
import Login from './Login';

const AuthTabs = ({ defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab === 'register' ? 1 : 0);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setActiveTab(defaultTab === 'register' ? 1 : 0);
  }, [defaultTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegisterSuccess = () => {
    setSuccessMessage('Registration successful! Please log in.');
    setActiveTab(0); // Switch to Login tab
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        mt={4}
        p={3}
        borderRadius={2}
        boxShadow={3}
        bgcolor="white"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {activeTab === 0 && <Login />}
        {activeTab === 1 && <Register onRegisterSuccess={handleRegisterSuccess} />}

        <Snackbar
          open={!!successMessage}
          onClose={() => setSuccessMessage('')}
          autoHideDuration={3000}
          message={successMessage}
        />
      </Box>
    </Container>
  );
};

export default AuthTabs;
