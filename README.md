# Lưu bút - Guestbook Website

Website lưu bút hiện đại với giao diện đẹp mắt và hiệu ứng cuộn mượt mà. Người dùng có thể gửi lưu bút, nghe nhạc nền, và chỉ quản trị viên mới có thể xem tất cả các lưu bút.

## Công nghệ sử dụng

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database & Storage**: Supabase
- **Animation & Effects**: Framer Motion, React-Fullpage, React-Confetti
- **Audio**: Howler.js
- **Deployment**: Vercel

## Tính năng chính

- Giao diện full-page scroll với hiệu ứng chuyển cảnh mượt mà
- Form gửi lưu bút với hiệu ứng confetti khi gửi thành công
- Phát nhạc nền với bộ điều khiển
- Trang quản trị viên để xem tất cả lưu bút
- Bảo mật theo cấp độ hàng (Row Level Security) với Supabase

## Cài đặt và chạy

### Yêu cầu

- Node.js (v18 hoặc cao hơn)
- Tài khoản Supabase

### Hướng dẫn cài đặt

1. **Clone repository và cài đặt dependencies**

```bash
git clone [đường-dẫn-đến-repository]
cd luu_but
npm install
```

2. **Thiết lập Supabase**

- Tạo tài khoản và dự án mới trên [Supabase](https://supabase.com)
- Thiết lập database schema theo hướng dẫn trong file `docs/supabase-schema.md`
- Tạo bucket Storage có tên `songs` để lưu trữ file nhạc
- Thiết lập Row Level Security (RLS) để bảo vệ dữ liệu

3. **Cấu hình biến môi trường**

Tạo file `.env.local` trong thư mục gốc dự án với nội dung sau:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_FULLPAGE_LICENSE_KEY=your-fullpage-license-key (nếu có)
```

Thay thế các giá trị với thông tin từ dự án Supabase của bạn:
- `your-supabase-url`: URL của dự án Supabase (Project Settings > API)
- `your-supabase-anon-key`: Anon/Public key của dự án Supabase (Project Settings > API)

4. **Chạy ứng dụng trong môi trường development**

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem trang web.

## Triển khai lên Vercel

Cách đơn giản nhất để triển khai ứng dụng Next.js là sử dụng [Vercel Platform](https://vercel.com):

1. Push code lên GitHub repository
2. Import project vào Vercel
3. Thiết lập các biến môi trường (`NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!

## Cấu trúc thư mục

```
luu_but/
├── docs/                # Tài liệu và hướng dẫn
├── public/              # Static files
├── src/
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   └── ...
├── .env.local           # Biến môi trường (không nằm trong git)
├── next.config.js
├── package.json
├── README.md
└── ...
```

## Tạo tài khoản admin

Để tạo tài khoản admin có quyền xem tất cả lưu bút:

1. Đăng ký tài khoản thông thường
2. Từ dashboard của Supabase, chạy SQL sau:

```sql
INSERT INTO public.admin_users (user_id) 
VALUES ('UUID-của-tài-khoản-admin');
```

Thay thế `UUID-của-tài-khoản-admin` bằng UUID thực tế của tài khoản bạn muốn cấp quyền admin.

## Tùy chỉnh và mở rộng

### Thêm bài nhạc

1. Upload file nhạc vào bucket `songs` trong Supabase Storage
2. Thêm bản ghi mới vào bảng `music_meta` với thông tin:
   - `title`: Tên bài hát
   - `file_path`: Đường dẫn tới file trong bucket `songs`

### Tùy chỉnh giao diện

- Các component chính nằm trong thư mục `src/components/`
- Các style chính được định nghĩa bằng Tailwind CSS
- Hiệu ứng chuyển trang được xử lý bởi `FullPageScroll.tsx`

## Xử lý sự cố

- **Lỗi đăng nhập admin**: Kiểm tra thông tin trong `.env.local` và thiết lập trong Supabase
- **Lỗi infinite recursion trong policy**: Xem hướng dẫn trong file `docs/fix-infinite-recursion.md`
- **Lỗi upload nhạc**: Đảm bảo bucket Storage `songs` đã được thiết lập đúng cách và RLS policies đã được cấu hình phù hợp

## License

[MIT License](LICENSE)
