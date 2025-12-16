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

Tạo file **`.env.local`** tại thư mục gốc:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Lưu ý:**

* Biến môi trường **phải bắt đầu bằng `NEXT_PUBLIC_`** để sử dụng phía client.
* Khi deploy production, thay bằng URL backend thực tế.

---

### 4️⃣ Chạy development server

```bash
npm run dev
```

➡️ Truy cập ứng dụng tại:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔗 Kết nối Backend

* Frontend giao tiếp với backend (FastAPI) thông qua **REST API**
* Base URL được cấu hình bằng biến môi trường:

```env
NEXT_PUBLIC_BACKEND_URL
```

* Toàn bộ API client được đặt trong thư mục `lib/` để dễ bảo trì & mở rộng

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
