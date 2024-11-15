// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthTabs from './components/AuthTabs';
import ChatInterface from './components/ChatInterface';
import { ChatProvider } from './context/ChatContext';

const App = () => {
  const isAuthenticated = !!sessionStorage.getItem('jwt');

  return (
    <ChatProvider>
      <Routes>
        {/* Redirect to /login if not authenticated */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<AuthTabs defaultTab="login" />} />
        <Route path="/register" element={<AuthTabs defaultTab="register" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatInterface /> : <Navigate to="/login" />} />
      </Routes>
    </ChatProvider>
  );
};

export default App;
