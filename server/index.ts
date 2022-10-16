import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv'
import { connectDB } from './src/db-connection';
import linkRoutes from './src/api/routes/linkRoutes';
import userRoutes from './src/api/routes/userRoutes';

// Load .env config file
config();
// Create connection to DB
connectDB();

// Set-up express server
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Http logger
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'tiny'));

app.use('api/users', userRoutes);
app.use('api/links', linkRoutes);

app.listen(port, () =>
    console.log(`🚀 Server running at: http://localhost:${port}`)
);