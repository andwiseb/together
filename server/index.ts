import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv'
import { connectDB } from './src/db-connection';
import { createServer } from "https";
import { clearAllRoomAutoCloseTimeouts, initSocket } from './src/socket-io';
import { readFileSync } from 'fs';

import roomRoutes from './src/api/routes/roomRoutes';
import userRoutes from './src/api/routes/userRoutes';
import roomInfoRoutes from './src/api/routes/roomInfoRoutes';

// Load .env config file
config();
// Create connection to DB
connectDB();

// Set-up express server
const port = process.env.PORT || 3000;
const app = express();
const httpServer = createServer({
    key: readFileSync(process.env.SSL_KEY_PATH!),
    cert: readFileSync(process.env.SSL_CERT_PATH!),
    requestCert: false,
    rejectUnauthorized: false
}, app);
// Init the socket.io server
initSocket(httpServer);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Http logger
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'tiny'));

// Serve the front-end from its directory
// app.use(express.static("dist-client"));

// Declare the API routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms-info', roomInfoRoutes);

// Allow routing from the front-end
/*app.use((req: Request, res: Response) => {
    res.sendFile(join(__dirname, "dist-client", "index.html"));
});*/

httpServer.on('close', () => {
    clearAllRoomAutoCloseTimeouts();
});

process.on('SIGINT', () => {
    httpServer.close();
});

httpServer.listen(port, () =>
    console.log(`🚀 Server running at: http://localhost:${port}`)
);

