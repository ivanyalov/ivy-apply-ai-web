import React from 'react';
import ReactDOM from 'react-dom/client';
import './input.css'; // Import the Tailwind CSS source
import App from './App';
import { AuthProvider } from '../shared/context/AuthContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
