import cors from 'cors'; //! Cors is necessary for different connections and applications
import config from './config';
import express from 'express';
import authRoutes from './routes/auth.routes';
import { globalLimiter } from './middlewares/rateLimiter';

const app = express();
app.use(cors({
  origin: config.cors_origins,
  credentials: true
})); //!! Implementation of the cors
app.use(globalLimiter);
app.use(express.json());

//? Routes
app.use('/auth', authRoutes);

//? Handlers for blocked routes and general errors
app.use((_req, res) => {
  res.status(404).json({ message: 'Internal server error' });
});

app.use((
  error: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error('Unhandled error -> ', error); //!!
  res.status(500).json({ message: 'Internal server error' });
});

export default app;