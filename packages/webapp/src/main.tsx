import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Import styles in the correct order
import '@mantine/core/styles.css';
import 'uno.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); 