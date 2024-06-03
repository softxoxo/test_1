import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());

interface User {
  email: string;
  number: string;
}

const users: User[] = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

app.get('/users', (req, res) => {
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Cancel the request if the client disconnects
  req.on('close', () => {
    abortController.abort();
  });

  setTimeout(() => {
    if (signal.aborted) {
      console.log('Request aborted');
      return;
    }

    const email = req.query.email as string;
    const number = req.query.number as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (number && !/^\d{6}$/.test(number)) {
      return res.status(400).json({ error: 'Invalid number' });
    }

    const filteredUsers = users.filter(
      (user: User) =>
        user.email === email && (number ? user.number === number : true)
    );
    res.json(filteredUsers);
  }, 5000);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});