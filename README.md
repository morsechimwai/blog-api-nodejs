# Blog API

RESTful API สำหรับระบบบล็อกที่พัฒนาด้วย **Node.js + TypeScript** รองรับการจัดการผู้ใช้ บทความ คอมเมนต์ และปฏิสัมพันธ์ต่าง ๆ (ไลก์/เลิกไลก์) พร้อมฟีเจอร์รักษาความปลอดภัย อัปโหลดรูปปกไปยัง Cloudinary และระบบตอบกลับที่เป็นมาตรฐานเดียวกัน

## Feature
- สร้างขึ้นบน **Express 5** พร้อม Middleware สำคัญ เช่น `helmet`, `compression`, `cors`, `express-rate-limit`
- เชื่อมต่อ **MongoDB** ผ่าน Mongoose, ใช้ `bcrypt` และ `jsonwebtoken` สำหรับระบบยืนยันตัวตนแบบ JWT
- อัปโหลดไฟล์ขึ้น **Cloudinary** ด้วย `multer` และโมดูลอัปโหลดเฉพาะ (`upload-blog-banner`)
- Sanitization ด้านความปลอดภัยด้วย `dompurify` + `jsdom` (กัน XSS) และ `express-validator` สำหรับตรวจสอบข้อมูลเข้า
- โครงสร้างโค้ดแยกเป็นชั้น (config, lib, middlewares, models, controllers, routes) ทำให้ดูแลรักษาง่าย
- มีการจำกัดจำนวนรีเควสต์ (60 req/นาที) และระบบล็อกด้วย `winston`

## Quick Start
1. ติดตั้ง Node.js เวอร์ชัน LTS (แนะนำ >= 20)
2. ติดตั้ง dependencies

```bash
npm install
```

3. สร้างไฟล์ `.env` แล้วเติมค่าตามตัวอย่างด้านล่าง
4. รันเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

เซิร์ฟเวอร์จะเปิดบน `http://localhost:<PORT>` (ค่าเริ่มต้น 3000)

### ตัวอย่างไฟล์ `.env`
```ini
NODE_ENV=development
PORT=3000
DOCS_URL=https://docs.blog-api.morsechimwai.com
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
LOG_LEVEL=info

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> หมายเหตุ: การสมัครเป็น `admin` จะตรวจสอบอีเมลกับ `WHITELIST_ADMINS_MAIL` ที่กำหนดใน `src/config/index.ts`

## Environment Variables
| ชื่อ | คำอธิบาย |
| --- | --- |
| `NODE_ENV` | สภาพแวดล้อมการรัน (`development`, `production`) |
| `PORT` | พอร์ตที่เซิร์ฟเวอร์จะรับฟัง |
| `DOCS_URL` | URL สำหรับเอกสาร API ภายนอก (ใช้โชว์ใน root endpoint) |
| `MONGO_URI` | Connection string ของ MongoDB |
| `LOG_LEVEL` | ระดับ log (`error`, `warn`, `info`, ฯลฯ) |
| `JWT_ACCESS_SECRET` | คีย์ลับสำหรับเซ็น Access Token |
| `JWT_REFRESH_SECRET` | คีย์ลับสำหรับเซ็น Refresh Token |
| `ACCESS_TOKEN_EXPIRY` | อายุของ Access Token (รองรับรูปแบบ `ms`, เช่น `15m`) |
| `REFRESH_TOKEN_EXPIRY` | อายุของ Refresh Token |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ค่าเชื่อมต่อ Cloudinary |

## Script NPM
- `npm run dev` – รันเซิร์ฟเวอร์ด้วย `nodemon` + `ts-node` (Hot reload)

## Project Structure
```text
src/
├─ @types/                 # Type augmentation เพิ่มเติม (ถ้ามี)
├─ config/                 # การตั้งค่าที่อ่านจาก environment
├─ controllers/v1/         # โลจิกของ API แต่ละกลุ่ม (auth, user, blog, comment, like)
├─ lib/                    # โมดูลเชื่อมต่อภายนอก (Cloudinary, Mongoose, Winston, JWT, Rate limit)
├─ middlewares/            # Middleware แบบกำหนดเอง (authenticate, authorize, validation-error, upload-banner)
├─ models/                 # Mongoose models (User, Blog, Comment, Like, Token)
├─ routes/v1/              # เส้นทางของ API พร้อม validation
├─ utils/                  # ตัวช่วยทั่วไป (response formatter, status map, slug/username generator)
└─ server.ts               # จุดเริ่มต้นของแอป Express
```

## NodeJS Libraries
| ไลบรารี | หน้าที่หลัก |
| --- | --- |
| `express` | เว็บเฟรมเวิร์กสำหรับจัดการ HTTP server และ routing |
| `cors`, `cookie-parser`, `compression`, `helmet` | จัดการ CORS, คุกกี้, บีบอัด response, และเพิ่ม HTTP header ด้านความปลอดภัย |
| `express-rate-limit` | จำกัดจำนวนคำขอ/IP ป้องกันการโจมตี |
| `express-validator` | ตรวจสอบและ sanitize ข้อมูลที่รับเข้ามา |
| `mongoose` | ODM สำหรับเชื่อมต่อและจัดการ MongoDB |
| `jsonwebtoken` | สร้างและตรวจสอบ JWT access/refresh token |
| `bcrypt` | แฮชรหัสผ่านก่อนบันทึก |
| `multer` | อ่าน multipart/form-data สำหรับอัปโหลดไฟล์ |
| `cloudinary` | อัปโหลด/จัดการรูปภาพของบทความ |
| `dompurify` + `jsdom` | ล้าง HTML content ป้องกัน XSS |
| `dotenv` | โหลดค่า environment variables จากไฟล์ `.env` |
| `winston` | ระบบล็อกแบบปรับแต่งได้ |
| `ts-node`, `tsconfig-paths`, `nodemon`, `typescript` | ใช้ในสภาพแวดล้อมพัฒนาเพื่อรัน TypeScript ได้แบบทันที |

## Authenication and Response
- ผู้ใช้ใหม่ลงทะเบียนผ่าน `POST /api/v1/auth/register` (สุ่ม `username` อัตโนมัติ)
- เมื่อเข้าสู่ระบบ (`POST /api/v1/auth/login`) เซิร์ฟเวอร์จะคืน Access Token (Response body) และ Refresh Token (HTTP-only cookie)
- รีเฟรช Access Token ด้วย `POST /api/v1/auth/refresh-token`
- ต้องแนบ `Authorization: Bearer <accessToken>` สำหรับทุก endpoint ที่ต้องการสิทธิ์
- รูปแบบ response ทั้งหมดใช้อ็อบเจ็กต์มาตรฐานจาก `src/utils/response.ts` (`success`, `code`, `message`, `data`, `error`, `detail`)

## API Docs (v1)
Base path: `/api/v1`  
ทุก endpoint ตอบกลับเป็น JSON และใช้เวลาเซิร์ฟเวอร์ (ISO 8601) ในฟิลด์ต่าง ๆ ที่ถูกกำหนดในโมเดล

### 1. Health Check
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `GET` | `/` | ไม่ต้องใช้ | ตรวจสอบสถานะ API และคืน `version`, `docs` |

### 2. Authentication
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | ไม่ต้องใช้ | สมัครสมาชิกใหม่ (`email`, `password`, `role?`) |
| `POST` | `/auth/login` | ไม่ต้องใช้ | เข้าสู่ระบบ ส่งกลับ Access Token + เซ็ต Refresh Token Cookie |
| `POST` | `/auth/refresh-token` | Cookie `refreshToken` | สร้าง Access Token ใหม่ |
| `POST` | `/auth/logout` | Bearer | เคลียร์ Refresh Token (DB + Cookie) |

### 3. Users
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `GET` | `/users/current` | Bearer (`admin`/`user`) | ดึงข้อมูลผู้ใช้ปัจจุบัน |
| `PUT` | `/users/current` | Bearer (`admin`/`user`) | แก้ไขโปรไฟล์ (username, email, password, social links) |
| `DELETE` | `/users/current` | Bearer (`admin`/`user`) | ลบบัญชีตนเอง (ลบบล็อกและรูปปกทั้งหมด) |
| `GET` | `/users` | Bearer (`admin`) | ดึงรายชื่อผู้ใช้ทั้งหมด รองรับ `limit`, `offset` |
| `GET` | `/users/:userId` | Bearer (`admin`) | ดูรายละเอียดผู้ใช้รายบุคคล |
| `DELETE` | `/users/:userId` | Bearer (`admin`) | ลบบัญชีผู้ใช้อื่น (รวมการลบรูปปกใน Cloudinary) |

### 4. Blogs
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `POST` | `/blogs` | Bearer (`admin`) | สร้างบทความใหม่ (multipart/form-data ชื่อไฟล์ `banner_image`) |
| `GET` | `/blogs` | Bearer (`admin`/`user`) | ดึงรายการบทความ (มี `page`, `limit`; ผู้ใช้ทั่วไปเห็นเฉพาะ `published`) |
| `GET` | `/blogs/user/:userId` | Bearer (`admin`/`user`) | บทความตามผู้เขียน (รองรับ `limit`, `offset`) |
| `GET` | `/blogs/:slug` | Bearer (`admin`/`user`) | ดูบทความจาก slug (ปิดการเข้าถึง draft สำหรับ role `user`) |
| `PUT` | `/blogs/:blogId` | Bearer (`admin`) | แก้ไขบทความ (รองรับการอัปโหลดปกใหม่) |
| `DELETE` | `/blogs/:blogId` | Bearer (`admin`) | ลบบทความและรูปปกที่ Cloudinary |

### 5. Likes
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `POST` | `/likes/blog/:blogId` | Bearer (`admin`/`user`) | กดไลก์บทความ (`userId` ใน body) |
| `DELETE` | `/likes/blog/:blogId` | Bearer (`admin`/`user`) | เลิกไลก์บทความ |

### 6. Comments
| Method | Path | Auth | คำอธิบาย |
| --- | --- | --- | --- |
| `POST` | `/comments/blog/:blogId` | Bearer (`admin`/`user`) | แสดงความคิดเห็น (`content`) |
| `GET` | `/comments/blog/:blogId` | Bearer (`admin`/`user`) | ดึงคอมเมนต์ทั้งหมดของบทความ |
| `DELETE` | `/comments/:commentId` | Bearer (`admin`/เจ้าของคอมเมนต์) | ลบคอมเมนต์ (ลดตัวนับคอมเมนต์ของบทความ) |

> การตรวจสอบรูปแบบข้อมูลทั้งหมดทำด้วย `express-validator` และข้อผิดพลาดจะย้อนกลับด้วยโค้ด `validation_failed`

## License [**Apache-2.0**](./LICENSE)