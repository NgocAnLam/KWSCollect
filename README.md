# 🎙️ KWS Collect App – Frontend

Ứng dụng web **frontend** cho hệ thống **thu thập, kiểm tra và quản lý dữ liệu giọng nói phục vụ bài toán Keyword Spotting (KWS)**.
Được xây dựng bằng **Next.js 14 (App Router)** và **TypeScript**, tối ưu cho hiệu năng, khả năng mở rộng và trải nghiệm người dùng.

---

## 📌 Tổng quan

Frontend này cung cấp giao diện để:

* 🎧 Thu thập dữ liệu âm thanh theo **keyword / câu mẫu**
* ✅ Hỗ trợ **kiểm tra chất lượng ghi âm** (âm lượng, thời lượng, nội dung)
* 🗂️ Quản lý, xem và chỉnh sửa dữ liệu KWS
* 🔗 Giao tiếp với backend thông qua **REST API**

Ứng dụng tận dụng các tính năng hiện đại của **Next.js 14** như:

* Server Components
* App Router
* Streaming & Static Rendering
  → đảm bảo **hiệu suất cao** và **UX mượt mà**.

---

## 🛠️ Công nghệ sử dụng

* **Next.js 14** (App Router)
* **React 18**
* **TypeScript**
* **Tailwind CSS** *(hoặc CSS Modules / styled-components tùy cấu hình)*
* **ESLint + Prettier** – đảm bảo chất lượng code

---

## 📁 Cấu trúc thư mục

```bash
.
├── app/                  # App Router: pages, layouts, server components
├── components/           # Các component tái sử dụng
├── lib/                  # Utilities, API client, hooks, helpers
├── public/               # Static assets (images, icons, fonts)
├── styles/               # Global styles / Tailwind setup
├── types/                # TypeScript interfaces & types
├── middleware.ts         # Middleware (auth, redirect, v.v.)
├── next.config.js
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md             # Tài liệu dự án
```

---

## ⚙️ Yêu cầu hệ thống

* **Node.js ≥ 18.x**
  *(Khuyến nghị sử dụng bản LTS mới nhất)*

---

## 🚀 Cài đặt & chạy local

### 1️⃣ Clone repository

```bash
git clone https://github.com/NgocAnLam/KWS_Collect_App.git
cd KWS_Collect_App
```

### 2️⃣ Cài đặt dependencies

```bash
npm install
```

### 3️⃣ Cấu hình môi trường

Tạo file **`.env`** (hoặc `.env.local`) tại thư mục gốc. Có thể copy từ **`.env.example`**:

```bash
cp .env.example .env
```

Các biến cần thiết:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-at-least-32-chars
# Backend: trỏ tới KWS_Server (một backend duy nhất cho Collect + KWS)
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
```

**Lưu ý:**

* **NEXT_PUBLIC_SERVER_URL** phải trỏ tới **KWS_Server** (không còn dùng KWS_Collect_Server riêng). CORS trên KWS_Server cần cho phép origin của Collect_App (vd. `http://localhost:3001`).
* Biến **NEXT_PUBLIC_** dùng được phía client. Khi deploy production, thay bằng URL KWS_Server thực tế.

---

### 4️⃣ Chạy development server

```bash
npm run dev
```

➡️ Truy cập ứng dụng tại:
**[http://localhost:3001](http://localhost:3001)**

---

## 👤 Quản lý Keyword và Sentence (Admin)

**Quan trọng:** Mục **Keywords** và **Sentences** trong Admin **chỉ có trong KWS_Collect_App** (ứng dụng này).  
Nếu bạn đang dùng **KWS_App** (trang có "Datasets Management", "Admin Users", v.v.) thì đó là app khác — **không có** Admin Keywords/Sentences ở đó. Hãy mở **KWS_Collect_App** (Collect App, thường chạy ở port khác, vd. `http://localhost:3001`) và đăng nhập Admin tại đây. Trong KWS_App, bạn có thể bấm **Collect App (Thu thập)** trên sidebar để mở Collect App.

Trang collect cần **Keyword** và **Sentence** do Admin tạo thì user mới có nội dung để ghi âm. Quy trình:

### 1. Tạo tài khoản Admin (lần đầu)

Trong thư mục **KWS_Server**, chạy script tạo admin:

```bash
cd KWS_Server
python scripts/create_admin.py
```

Script tạo user `admin` với mật khẩu mặc định (xem in ra trong console). Đổi mật khẩu sau khi đăng nhập lần đầu nếu cần.

### 2. Đăng nhập Admin

1. Mở **Collect App** (vd. `http://localhost:3001` — port tùy cấu hình khi chạy `npm run dev`).
2. Vào **Đăng nhập** (`/login`).
3. Nhập **username** và **password** của admin (vd. `admin` / mật khẩu từ bước 1).

### 3. Tạo Keyword (Từ khóa)

1. Sau khi đăng nhập, vào **Admin Panel** → **Keywords** (`/admin/keywords`).
2. Bấm **Thêm từ khóa** (hoặc nút tương đương).
3. Nhập **nội dung từ khóa** (vd. `xin chào`, `bật đèn`) — chỉ tiếng Việt, không trùng từ đã có.
4. Lưu. Các từ khóa này sẽ hiển thị cho user ở trang thu âm keyword.

### 4. Tạo Sentence (Câu thu âm)

1. Vào **Admin Panel** → **Sentences** (`/admin/sentences`).
2. Bấm **Thêm câu mới**.
3. Nhập **nội dung câu đầy đủ** (vd. `Hà Nội là thủ đô ngàn năm văn hiến của Việt Nam`).
4. Chọn **Từ khóa cần nhấn mạnh** từ dropdown — dropdown lấy từ danh sách **Keyword** đã tạo ở bước 3. Từ khóa phải **nằm trong câu**.
5. Lưu. Câu mới sẽ dùng cho bước thu âm câu (sentence) của user.

**Lưu ý:** Tạo **Keyword** trước, sau đó mới tạo **Sentence** (vì mỗi câu phải gắn với một từ khóa có sẵn).

---

## 🔗 Kết nối Backend (KWS_Server)

* Frontend giao tiếp với **KWS_Server** (FastAPI) thông qua **REST API** (Collect API: `/admin/*`, `/user/*`).
* Base URL được cấu hình bằng biến môi trường **`NEXT_PUBLIC_SERVER_URL`** (vd. `http://localhost:8000`).
* Trên KWS_Server, cấu hình **CORS_ORIGINS** để cho phép origin của Collect_App (vd. `http://localhost:3001`).
* Toàn bộ API client được đặt trong thư mục `lib/` và gọi trực tiếp `NEXT_PUBLIC_SERVER_URL` để dễ bảo trì & mở rộng.

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp cho dự án 🎉

Quy trình đề xuất:

1. Fork repository
2. Tạo branch mới:

   ```bash
   git checkout -b feature/ten-tinh-nang
   ```
3. Commit thay đổi với message rõ ràng
4. Push branch và tạo **Pull Request**

---

## 📄 Giấy phép

Dự án phục vụ **nghiên cứu, học tập và phát triển hệ thống KWS**.
Vui lòng kiểm tra LICENSE (nếu có) trước khi sử dụng cho mục đích thương mại.
