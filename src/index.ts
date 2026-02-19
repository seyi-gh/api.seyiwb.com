import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
app.use(cors()); //!
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/', (_req, res) => {
  res.send('Sending correctly');
});

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});