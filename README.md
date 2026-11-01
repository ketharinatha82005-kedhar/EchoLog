# EchoLog — MERN Social Publishing Platform

A responsive MERN application for publishing text stories, photos and videos, discovering posts by hashtag, liking and sharing posts, commenting, and following creators. The UI follows the supplied EchoLog references: editorial feed cards, creator profile statistics, and a media gallery.

## Stack
- React 18 + Vite + React Router + Lucide icons
- Node.js + Express REST API
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Multer local multipart uploads (images and videos)

## Requirements
Node.js 18.18+ (Node 20 LTS recommended), npm, and MongoDB local or MongoDB Atlas.

## Run locally
From this folder:

```bash
npm install
npm run install:all
```

Create `server/.env` from the example and configure it:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/echolog
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

PowerShell copy command: `Copy-Item server/.env.example server/.env`. Start MongoDB, then run `npm run dev` from the project root. Frontend: http://localhost:5173. API: http://localhost:5000.

## Check backend and database
1. Start the backend with `npm run dev --prefix server`. The terminal should print `MongoDB connected: ...` followed by `API running at http://localhost:5000`. If MongoDB fails, check `MONGO_URI`, Atlas network access, username/password URL encoding, and that the database service is running.
2. Open `http://localhost:5000/api/health`. Expected JSON includes `status: ok`, `database: connected`, and your MongoDB database name. This health route is served only after a successful database connection.
3. Register at `/register`, then use the browser Network tab to check `POST /api/auth/register` returns 201 and a token.
4. Publish a text post and attach a photo/video. Check `POST /api/posts/upload` returns 201 and the post contains `media` entries. Uploaded files are served from `http://localhost:5000/uploads/<filename>`.
5. Like a post: `POST /api/posts/:id/like` with `Authorization: Bearer <token>`. Follow a creator: `POST /api/users/:id/follow`. Both require login.
6. In MongoDB Compass, connect using the same `MONGO_URI` and inspect the `users` and `posts` collections.

Quick API health test:
```bash
curl http://localhost:5000/api/health
```

## Features
- Register/login and protected publishing actions
- Publish text, image and video posts using actual file uploads (not remote image URLs)
- Up to 10 media files per post, 100MB per file; supported images JPG/PNG/GIF/WEBP and videos MP4/WEBM/MOV
- Like/unlike, share counter and copyable post URL, comments
- Follow/unfollow users; profile follower/following counts
- Creator profile with posts and image/video gallery
- Hashtag extraction from composer input and hashtag fields; hashtag values stored lowercase
- Responsive desktop/mobile feed and profile layout

## REST API
All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | API and database status | No |
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login | No |
| GET | `/auth/me` | Current account | Yes |
| GET | `/posts` | Feed | No |
| GET/PUT/DELETE | `/posts/:id` | Read/edit/delete a post | Edit/delete: Yes |
| POST | `/posts/upload` | Multipart photo/video/text post | Yes |
| POST | `/posts/:id/like` | Like/unlike | Yes |
| POST | `/posts/:id/share` | Increment share count | No |
| POST/DELETE | `/posts/:id/comments` | Add/delete comments | Yes |
| GET | `/users/:id` | Public profile and posts | No |
| GET | `/users/:id/follow-status` | Follow state for signed-in user | Yes |
| POST | `/users/:id/follow` | Follow/unfollow | Yes |
| GET | `/hashtags/:tag` | Find posts by hashtag | No |

## Upload storage and deployment note
Uploads are stored in `server/uploads/` when the backend is started from the server directory (or the backend working directory's `uploads/`). The `.gitignore` excludes uploaded files and environment secrets. For production, use persistent object storage (for example S3/Cloudinary) and a durable database; local disk uploads may be lost on ephemeral hosting. Set `VITE_API_URL` at build time if the API is not at `http://localhost:5000/api`, and configure CORS `CLIENT_URL`.

## GitHub
```bash
git init
git add .
git commit -m "Build EchoLog social publishing app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/echolog-mern.git
git push -u origin main
```
Do not commit `server/.env`, secrets, `node_modules`, or user-uploaded media. Create a `.env` file on your deployment host.
