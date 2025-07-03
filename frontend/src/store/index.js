// frontend/src/index.js - MINIMAL VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('index.js loaded!'); // Debug log

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully!'); // Debug log
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback render
  root.render(
    <div>
      <h1>Error Loading App</h1>
      <p>Check console for details</p>
      <pre>{error.toString()}</pre>
    </div>
  );
}