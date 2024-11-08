// src/App.js
import React from 'react';
import { ChatProvider } from './context/ChatContext';
import AuthTabs from './components/AuthTabs';

const App = () => (
  <ChatProvider>
    <AuthTabs />
  </ChatProvider>
);

export default App;
