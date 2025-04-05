import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Example of how to fetch from the API
    fetch('/api')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => {
        console.error('Error fetching from API:', error);
        setMessage('Failed to connect to API');
      });
  }, []);

  return (
    <>
      <h1>Quiz2 Web App</h1>
      <div className="card">
        <p>Message from API: {message}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App; 