import React, { useState, useRef } from 'react';
import axios from 'axios';
import MaskedInput from "react-text-mask"
import './App.css';

interface User {
  email: string;
  number: string;
}

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Cancel the previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await axios.get('http://localhost:5000/users', {
        params: { email, number: number.replace(/-/g, '') },
        signal: abortController.signal,
      });
      setUsers(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching users:', error);
      }
    }

    setLoading(false);
    abortControllerRef.current = null; // Reset the abortControllerRef
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="app">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="number">Number:</label>
            <MaskedInput
              id="number"
              mask={[/\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/]}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {loading && <button type="button" onClick={handleCancel}>Cancel</button>}
        </form>
      </div>
      {users.length > 0 ? (
        <div className="results-container">
          <h2>Search Results:</h2>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                Email: {user.email}, Number: {user.number}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="results-container">
          <h2>{loading ? 'Searching...' : 'No results found'}</h2>
        </div>
      )}
    </div>
  );
};

export default App;