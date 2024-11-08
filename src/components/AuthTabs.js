// src/components/AuthTabs.js
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import Register from './Register';
import Login from './Login';

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        {activeTab === 1 && <Register />}
      </Box>
    </Container>
  );
};

export default AuthTabs;
