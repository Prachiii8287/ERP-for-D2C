// src/index.js - FIXED VERSION (No Redux)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Optional: only if you have this file

console.log('✅ index.js loaded successfully!');

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  // Fallback render
  root.render(
    <div style={{ padding: '20px', color: 'red' }}>
      <h1>❌ Rendering Error</h1>
      <p>Error: {error.message}</p>
      <p>Check console for more details</p>
    </div>
  );
}