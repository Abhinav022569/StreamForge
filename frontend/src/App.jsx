import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // Try to talk to the Backend
    axios.get('http://127.0.0.1:5000/')
      .then(response => setStatus(response.data.message))
      .catch(error => setStatus("Error: Is Backend running?"));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>ETL Pipeline Builder</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;