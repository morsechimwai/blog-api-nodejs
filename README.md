# Blog API

Blog API เป็นบริการ RESTful สำหรับจัดการผู้ใช้งาน, โพสต์บล็อก, ความคิดเห็น, การกดไลค์, และสื่อต่างๆ พัฒนาด้วย Node.js, TypeScript, Express 5, และ MongoDB พร้อมด้วยเครื่องมือความปลอดภัยระดับสูงและการเชื่อมต่อ Cloudinary สำหรับการอัปโหลดแบนเนอร์

## Features
- **Express 5 Framework** พร้อม middleware สำหรับความปลอดภัย (`helmet`), การบีบอัดข้อมูล, CORS, และการจำกัดอัตราการเรียก API
- **ระบบยืนยันตัวตน JWT** ด้วย access/refresh tokens, การจัดการ cookie ที่ปลอดภัย, และการแยกสิทธิ์ admin/user
- **โมเดลฐานข้อมูล MongoDB** ที่ขับเคลื่อนด้วย Mongoose พร้อมกฎการเป็นเจ้าของข้อมูลและตัวช่วยจัดการหน้า
- **การกรองเนื้อหา rich-text** โดยใช้ `dompurify` + `jsdom` ร่วมกับการตรวจสอบความถูกต้องของคำขอผ่าน `express-validator`
- **การอัปโหลดไฟล์ Cloudinary** ผ่าน Multer และ middleware กำหนดเองสำหรับการสร้างและอัปเดตแบนเนอร์โพสต์
  - **ขีดจำกัดขนาดไฟล์**: สูงสุด 2MB
  - **รูปแบบที่รองรับ**: รูปภาพมาตรฐาน (JPEG, PNG, GIF, WebP)
  - **ข้อกำหนดการอัปโหลด**: ต้องมีรูปแบนเนอร์สำหรับโพสต์บล็อก
- **ระบบ logging แบบรวมศูนย์** (`winston`) และการตอบกลับ API ที่สม่ำเสมอเพื่อการใช้งานที่ง่ายขึ้น

## Requirements
- Node.js 20 or newer (LTS recommended)
- MongoDB connection string
- Cloudinary credentials for image uploads

## Getting Started
1. **โคลน repository** และเข้าไปยังโฟลเดอร์โปรเจค
2. **คัดลอกไฟล์ Environment** จาก `.env.example` เป็น `.env` และอัปเดตด้วยข้อมูลจริงของคุณ:
   ```bash
   cp .env.example .env
   ```
3. **ติดตั้ง dependencies** ด้วยคำสั่ง `npm install`
4. **เริ่มเซิร์ฟเวอร์พัฒนา** โดยใช้ `npm run dev` - API จะทำงานที่ `http://localhost:<PORT>` (ค่าเริ่มต้น `3000`)
5. **สร้าง build สำหรับ production** ด้วย `npm run build` และรันผลลัพธ์ที่คอมไพล์แล้วด้วย `npm run start`

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

## Default Configuration

| Setting | Default Value | Description |
| --- | --- | --- |
| Default pagination limit | `20` | Items per page for general listing |
| Default pagination offset | `0` | Starting index for pagination |
| Max file upload size | `2MB` | Maximum banner image file size |
| Rate limit window | `1 minute` | Time window for rate limiting |
| Rate limit requests | `60` | Max requests per IP per window |
| Cookie security | `HttpOnly, Secure, SameSite` | Refresh token cookie settings |

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

## Database Schema & Relationships

### Core Models
- **User**: Authentication and profile management
  - Fields: `username`, `email`, `password`, `role`, `firstName`, `lastName`, `socialLinks`
  - Relationships: One-to-many with Blogs, Comments, Likes

- **Blog**: Content management with rich media
  - Fields: `title`, `slug`, `content`, `banner`, `status`, counters (`viewsCount`, `likesCount`, `commentsCount`)
  - Relationships: Belongs to User (author), has many Comments and Likes

- **Comment**: User engagement on blog posts
  - Relationships: Belongs to User and Blog

- **Like**: User reactions to blog posts
  - Relationships: Belongs to User and Blog (composite unique constraint)

- **Token**: JWT refresh token management
  - Relationships: Belongs to User

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
| `POST` | `/auth/login` | Public | Authenticate and receive access/refresh tokens; sets `refreshToken` as HttpOnly, Secure, SameSite cookie |
| `POST` | `/auth/refresh-token` | Refresh cookie | Issue a new access token using the `refreshToken` cookie |
| `POST` | `/auth/logout` | Bearer (`admin` or `user`) | Invalidate the current refresh token and clear auth cookies |

**Payload highlights**
- `register`: `{ email, password, role? }` (role defaults to `user`)
- `login`: `{ email, password }`

**Example responses**
```json
// Successful login (200)
{
  "success": true,
  "code": "login_success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}

// Authentication error (401)
{
  "success": false,
  "code": "invalid_credentials",
  "message": "Email or password is incorrect"
}

// Validation error (400)
{
  "success": false,
  "code": "validation_failed",
  "message": "Blog banner must be smaller than 2MB.",
  "error": {
    "field": "banner_image",
    "type": "validation_error"
  }
}
```

## Error Handling
The API uses consistent HTTP status codes and error response formats:

| Status Code | Description | Common Scenarios |
| --- | --- | --- |
| `200` | OK | Successful operations |
| `201` | Created | Resource successfully created |
| `204` | No Content | Successful deletion |
| `400` | Bad Request | Validation errors, malformed requests |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate resource (email, username, slug) |
| `413` | Payload Too Large | File upload exceeds size limit |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side errors |

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
- `PUT /users/current`: accepts optional fields with validation:
  - `username` (max 20 characters)
  - `email` (max 50 characters)
  - `password` (hashed automatically)
  - `firstName`, `lastName` (max 20 characters each)
  - Social links (max 100 characters each): `website`, `facebook`, `instagram`, `x`, `youtube`

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
- Create/Update:
  - `title` (required for create, max 180 characters)
  - `content` (required for create)
  - `status` (optional: `draft` or `published`, defaults to `draft`)
  - `banner_image` (multipart file, required for create, max 2MB)
- Pagination:
  - `page` (>=1, for general blog listing)
  - `limit` (1–100 for general listing, 1–50 for user-scoped listing)
  - `offset` (>=0 for user-scoped listing, default: 0)

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
- **Rate limiting configuration**:
  - **Limit**: 60 requests per minute per IP address
  - **Window**: 1 minute (60,000ms)
  - **Headers**: Returns `RateLimit-*` headers (standard), excludes legacy `X-RateLimit-*` headers
  - **Error response**: Returns structured error message when limit exceeded
- **Admin whitelist**: Admin email allowlist lives in `src/config/index.ts` (`WHITELIST_ADMINS_MAIL`)
- **Response format**: All API responses follow a consistent envelope structure:
  ```json
  {
    "success": boolean,
    "code": "string",
    "message": "string",
    "data": object,     // Success responses only
    "error": object,    // Error responses only
    "detail": "string"  // Additional error context (optional)
  }
  ```

## Contributing

ผมยังต้องฝึกอีกเยอะ และโปรเจคนี้ก็ยังมีช่องว่างให้พัฒนาอีกมากครับ
หากคุณพบเห็นส่วนไหนที่สามารถปรับปรุงให้ดีขึ้นได้ — ไม่ว่าจะเล็กหรือใหญ่ — ยินดีรับทุกความช่วยเหลือจากทุก ๆ ท่านเลยครับ 🙏

ขั้นตอนร่วมสนับสนุน:

1. Fork repo นี้ไปที่ของคุณ
2. สร้าง branch สำหรับส่วนที่คุณอยากปรับปรุง
3. ลงมือเขียนโค้ด หรือเพิ่มเทสท์ หากจำเป็น
4. ส่ง Pull Request พร้อมเล่าว่าคุณปรับปรุงอะไร อย่างไรบ้าง และทำไมถึงสำคัญ

ทุกการมีส่วนร่วม ทั้งโค้ด ไอเดีย หรือ feedback ช่วยให้โปรเจคนี้เติบโตเร็วขึ้นมากครับ
ขอบคุณที่มาช่วยกันสร้างสิ่งนี้ให้ดีขึ้นไปด้วยกันครับ 🩵

---

**🧑‍💻 Happy Hacking!**
