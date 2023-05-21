import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css'
import { SocketProvider } from './contexts/SocketProvider';
import { UserProvider } from './contexts/UserProvider';
import "./index.css"
import { ChatProvider } from './contexts/ChatProvider';

ReactDOM.render(
  <React.StrictMode>
    <UserProvider>
      <SocketProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </SocketProvider>
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);