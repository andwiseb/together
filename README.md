# Watch-Together Clone
Watch videos together from various video platforms.

File paths, YouTube, Facebook, Twitch, SoundCloud, Streamable, Vimeo, Wistia, Mixcloud, DailyMotion and Kaltura.
## Install:
### Server:
```
cd server
npm install
```
You need to create the environment file `.env` in `server` directory and put the following:
```
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://username:password@localhost:3306/watch-together-clone"
SOCKET_ORIGINS=http://127.0.0.1:5173 #or whatever the ip of the front-end
```
Last step, create the database: `npx prisma migrate deploy`.

Now you run the server: `npm run devServer`.

### Client:
```
cd client
npm install
```
You need to create the environment file `.env.development` in `client` directory and put the following:

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_DEF_ROOM_VIDEO_URL=https://www.youtube.com/watch?v=BkKDSFYvxKU
```

Now you can run the front-end: `npm run devClient`.

## Build:
### Server:
Execute the build command: `npm run build` in the server directory.

This command should generate a `dist` folder contains the JS files of the backend.

### Client:
First, make sure to create the environment file `.env.production` in client directory and put in it the same keys from `.env.development` with production values, also you need to add new key just for production:
```
# list of domains, use ; to add multiple entries
VITE_TWITCH_DOMAINS=www.test.com;test22.com
```

Execute the build command: `npm run build` in the client directory.

This command should generate a `dist` folder contains the js bundle of the client.
