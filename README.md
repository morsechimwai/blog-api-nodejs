# Blog API

Blog API is a RESTful service for managing users, blog posts, comments, likes, and media assets. It is built with Node.js, TypeScript, Express 5, and MongoDB, and ships with first-class security utilities and Cloudinary integration for banner uploads.

## Features
- Express 5 stack with middleware for security (`helmet`), compression, CORS, and rate limiting
- JWT authentication with access/refresh tokens, secure cookie handling, and admin/user role separation
- MongoDB models powered by Mongoose, including soft ownership rules and pagination helpers
- Sanitised rich-text content using `dompurify` + `jsdom`, alongside request validation via `express-validator`
- Cloudinary uploads handled through Multer and a custom banner middleware for post creation and updates
- Centralised logging (`winston`) and consistent API responses for easier client consumption

## Requirements
- Node.js 20 or newer (LTS recommended)
- MongoDB connection string
- Cloudinary credentials for image uploads

## Getting Started
1. Copy `.env.example` to `.env` and provide real credentials.
2. Install dependencies with `npm install`.
3. Start the development server using `npm run dev`. The API listens on `http://localhost:<PORT>` (defaults to `3000`).
4. Build for production with `npm run build` and run the compiled output via `npm run start`.

## Environment Variables
| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development`
| `PORT` | HTTP port | `3000`
| `DOCS_URL` | External documentation link exposed on `/v1` root response | `https://docs.blog-api.example.com`
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster/db`
| `LOG_LEVEL` | Winston log level | `info`
| `JWT_ACCESS_SECRET` | Secret used to sign short-lived access tokens | `your-access-secret`
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens | `your-refresh-secret`
| `ACCESS_TOKEN_EXPIRY` | Access token TTL (supports `ms` syntax) | `15m`
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL | `7d`
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `demo`
| `CLOUDINARY_API_KEY` | Cloudinary API key | `111111111111111`
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `change-me`

## Scripts
- `npm run dev` – run the API with nodemon and ts-node
- `npm run build` – compile TypeScript and rewrite path aliases into `dist`
- `npm run start` – serve the compiled build from `dist`
- `npm run start:prod` – start the compiled build with PM2 (configured name: `blog-api`)

## Project Structure
```text
src/
├─ @types/                 # Additional type augmentations
├─ config/                 # Environment-driven configuration
├─ controllers/v1/         # Route handlers grouped by resource
├─ lib/                    # Third-party integrations (Cloudinary, Mongoose, JWT, logging)
├─ middlewares/            # Custom Express middlewares (auth, rate limit, upload, validation)
├─ models/                 # Mongoose schemas
├─ routes/v1/              # Versioned API routes and validators
├─ utils/                  # Helpers (responses, status mapping, slug generation)
└─ server.ts               # Express bootstrapper
```

## Key Libraries
| Purpose | Library |
| --- | --- |
| HTTP server & routing | `express`
| Environment management | `dotenv`
| Database ODM | `mongoose`
| Authentication | `jsonwebtoken`, `bcrypt`
| Validation & sanitisation | `express-validator`, `dompurify`, `jsdom`
| Security middleware | `helmet`, `cors`, `compression`, `express-rate-limit`
| File uploads | `multer`, custom Cloudinary wrapper
| Logging | `winston`

## API Reference
All routes are prefixed with `/v1`. Authenticated routes expect a Bearer token generated from the login endpoint unless stated otherwise. Request bodies are JSON unless handling multipart uploads.

### Authentication
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a new account (optional `role`, defaults to `user`) |
| `POST` | `/auth/login` | Public | Authenticate and receive access/refresh tokens; sets `refreshToken` as HttpOnly cookie |
| `POST` | `/auth/refresh-token` | Refresh cookie | Issue a new access token using the `refreshToken` cookie |
| `POST` | `/auth/logout` | Bearer (`admin` or `user`) | Invalidate the current refresh token and clear auth cookies |

**Payload highlights**
- `register`: `{ email, password, role? }`
- `login`: `{ email, password }`

### Users
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users/current` | Bearer (`admin`, `user`) | Fetch the currently authenticated user |
| `PUT` | `/users/current` | Bearer (`admin`, `user`) | Update profile fields, password, or social links |
| `DELETE` | `/users/current` | Bearer (`admin`, `user`) | Delete the currently authenticated account |
| `GET` | `/users` | Bearer (`admin`) | List users with `limit` (1–50) and `offset` pagination |
| `GET` | `/users/:userId` | Bearer (`admin`) | Retrieve a user by Mongo ID |
| `DELETE` | `/users/:userId` | Bearer (`admin`) | Remove a user account and related banner assets |

**Payload highlights**
- `PUT /users/current`: accepts optional `username`, `email`, `password`, `firstName`, `lastName`, and social URLs (`website`, `facebook`, `instagram`, `x`, `youtube`).

### Blogs
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/blogs` | Bearer (`admin`) | Create a blog post; supports multipart `banner_image` |
| `GET` | `/blogs` | Bearer (`admin`, `user`) | List blogs with `page` and `limit`; users see only published posts |
| `GET` | `/blogs/user/:userId` | Bearer (`admin`, `user`) | Fetch posts authored by a user with `limit` and `offset` |
| `GET` | `/blogs/:slug` | Bearer (`admin`, `user`) | Retrieve a post by slug (`draft` visible to admins only) |
| `PUT` | `/blogs/:blogId` | Bearer (`admin`) | Update a post; accepts multipart `banner_image` and content/status changes |
| `DELETE` | `/blogs/:blogId` | Bearer (`admin`) | Delete a post and its associated Cloudinary banner |

**Payload highlights**
- Create/Update: `title`, `content`, optional `status` (`draft` or `published`), optional multipart `banner_image`.
- Pagination: `page` (>=1), `limit` (1–100), `offset` (>=0 for user-scoped listing).

### Likes
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/likes/blog/:blogId` | Bearer (`admin`, `user`) | Like a blog post; body requires `userId` |
| `DELETE` | `/likes/blog/:blogId` | Bearer (`admin`, `user`) | Unlike a blog post; body requires `userId` |

### Comments
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/comments/blog/:blogId` | Bearer (`admin`, `user`) | Add a comment to a blog post (`content` required) |
| `GET` | `/comments/blog/:blogId` | Bearer (`admin`, `user`) | List comments for a blog post |
| `DELETE` | `/comments/:commentId` | Bearer (`admin`, comment owner) | Remove a specific comment |

## Notes
- Rate limiting defaults to 60 requests per minute per IP.
- Admin email allowlist lives in `src/config/index.ts` (`WHITELIST_ADMINS_MAIL`).
- Responses share a common envelope: `{ code, message, type, data }`.

## Contributing

ผมยังต้องฝึกอีกเยอะ และโปรเจคนี้ก็ยังมีช่องว่างให้พัฒนาอีกมากครับ
หากคุณพบเห็นส่วนไหนที่สามารถปรับปรุงให้ดีขึ้นได้—ไม่ว่าจะเล็กหรือใหญ่—ยินดีรับทุกความช่วยเหลือจากชุมชนเลยครับ 🙏

ขั้นตอนร่วมสนับสนุนก็ง่ายมาก:

1. Fork repo นี้ไปที่ของคุณ
2. สร้าง branch สำหรับส่วนที่คุณอยากปรับปรุง
3. ลงมือเขียนโค้ด หรือเพิ่มเทสท์ หากจำเป็น
4. ส่ง Pull Request พร้อมเล่าว่าคุณปรับปรุงอะไร อย่างไรบ้าง และทำไมถึงสำคัญ

ทุกการมีส่วนร่วม ทั้งโค้ด ไอเดีย หรือ feedback ช่วยให้โปรเจคนี้เติบโตเร็วขึ้นมากครับ
ขอบคุณที่มาช่วยกันสร้างสิ่งนี้ให้ดีขึ้นไปด้วยกันครับ 🩵

---

**🧑‍💻 Happy Hacking!**
