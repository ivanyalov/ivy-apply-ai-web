import React from 'react';
import ReactDOM from 'react-dom/client';
import './output.css'; // Import the generated Tailwind CSS
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
