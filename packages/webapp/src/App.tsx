import { useState, useEffect } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Quiz2 Web App</h1>
      <div className="p-8 border rounded shadow-md max-w-md mx-auto">
        <p className="mb-4">Message from API: {message}</p>
        <p className="text-sm">
          Edit <code className="px-2 py-1 bg-gray-100 rounded font-mono">src/App.tsx</code> and save to test HMR
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Click me
        </button>
      </div>
    </div>
  );
}

export default App; 