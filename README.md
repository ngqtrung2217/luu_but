# Lưu bút - Modern Guestbook Website

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

<a id="english"></a>
## 🇺🇸 English

A modern guestbook website with a beautiful interface and smooth scrolling effects. Users can send messages, listen to background music, while only administrators can view all entries. Features a dynamic music player with autoplay, shuffle, cross-fade transitions, and visual effects.

### Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database & Storage**: Supabase
- **Animation & Effects**: Framer Motion, React-Fullpage, React-Confetti
- **Audio**: Howler.js
- **Email**: Nodemailer

---

<a id="tiếng-việt"></a>
## 🇻🇳 Tiếng Việt

Website lưu bút hiện đại với giao diện đẹp mắt và hiệu ứng cuộn mượt mà. Người dùng có thể gửi lưu bút, nghe nhạc nền, và chỉ quản trị viên mới có thể xem tất cả các lưu bút. Tính năng trình phát nhạc động với autoplay, xáo trộn, chuyển tiếp mờ dần và hiệu ứng hình ảnh.
### Công nghệ sử dụng

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database & Storage**: Supabase
- **Animation & Effects**: Framer Motion, React-Fullpage, React-Confetti
- **Audio**: Howler.js
- **Email**: Nodemailer
- **Deployment**: Vercel

---

## 🌟 Key Features

### English
- Full-page scroll interface with smooth page transitions
- Guestbook form with confetti effect on successful submission
- Advanced background music player with:
  - Autoplay on page load (with user interaction fallback)
  - Track shuffle and randomized playback
  - Cross-fade transitions between tracks
  - Visual effects (lines, circles, galaxy)
  - Visual effects can be hidden on admin pages
- Admin panel to view and manage all guestbook entries
- Admin music management panel to upload and control music tracks
- Row Level Security (RLS) with Supabase for data protection
- Email notifications for admins and thank-you emails for users

### Tiếng Việt - Tính năng chính

- Giao diện full-page scroll với hiệu ứng chuyển cảnh mượt mà
- Form gửi lưu bút với hiệu ứng confetti khi gửi thành công
- Trình phát nhạc nền nâng cao với:
  - Tự động phát khi tải trang (với phương án dự phòng tương tác người dùng)
  - Xáo trộn bài hát và phát ngẫu nhiên
  - Chuyển tiếp mờ dần giữa các bài hát
  - Hiệu ứng hình ảnh (đường, vòng tròn, thiên hà)
  - Có thể ẩn hiệu ứng hình ảnh trên các trang quản trị
- Trang quản trị để xem và quản lý tất cả các lưu bút
- Trang quản lý nhạc để tải lên và kiểm soát các bài hát
- Bảo mật theo cấp độ hàng (Row Level Security) với Supabase
- Thông báo email cho quản trị viên và email cảm ơn cho người dùng

## 🚀 Installation and Setup

### Requirements

- Node.js (v18 or higher)
- Supabase account

### Installation Guide

1. **Clone the repository and install dependencies**

```bash
git clone https://github.com/yourusername/luu_but.git
cd luu_but
npm install
```

2. **Set up Supabase**

- Create an account and new project on [Supabase](https://supabase.com)
- Set up the database schema following the instructions in `docs/supabase-schema.md`
- Create a Storage bucket named `songs` to store music files
- Set up Row Level Security (RLS) to protect data

3. **Configure environment variables**

Create a `.env.local` file in the project root folder with the following contents:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_FULLPAGE_LICENSE_KEY=your-fullpage-license-key (optional)
MAILER_EMAIL=your-notification-email
MAILER_PASSWORD=your-app-password
ADMIN_EMAIL=admin-notification-recipient-email
```

Replace the values with information from your Supabase project:
- `your-supabase-url`: URL of your Supabase project (Project Settings > API)
- `your-supabase-anon-key`: Anon/Public key of your Supabase project (Project Settings > API)
- `your-notification-email`: Email address to send notifications from
- `your-app-password`: App password for the email service
- `admin-notification-recipient-email`: Email to receive admin notifications

4. **Run the application in development environment**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Hướng dẫn cài đặt (Tiếng Việt)

1. **Clone repository và cài đặt dependencies**

```bash
git clone https://github.com/yourusername/luu_but.git
cd luu_but
npm install
```

2. **Thiết lập Supabase**

- Tạo tài khoản và dự án mới trên [Supabase](https://supabase.com)
- Thiết lập database schema theo hướng dẫn trong file `docs/supabase-schema.md`
- Tạo bucket Storage có tên `songs` để lưu trữ file nhạc
- Thiết lập Row Level Security (RLS) để bảo vệ dữ liệu

3. **Cấu hình biến môi trường**

Tạo file `.env.local` trong thư mục gốc dự án với các biến môi trường (xem phần tiếng Anh ở trên).

4. **Chạy ứng dụng trong môi trường development**

```bash
npm run dev
```

## 🚀 Deployment to Vercel

The easiest way to deploy a Next.js application is using the [Vercel Platform](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Set up the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.)
4. Deploy!

See `docs/vercel-deployment.md` for detailed instructions.

## 📁 Project Structure

```
luu_but/
├── docs/                # Documentation and guides
├── public/              # Static files
│   ├── images/          # Image assets
│   └── ...              # Other static assets
├── src/
│   ├── app/             # App Router pages
│   │   ├── admin/       # Admin interface
│   │   ├── api/         # API endpoints
│   │   └── ...          # Other pages
│   ├── components/      # React components
│   │   ├── MusicPlayer.tsx    # Music player components
│   │   ├── GuestbookForm.tsx  # Guestbook submission form
│   │   └── ...          # Other components
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   │   ├── supabase.ts  # Supabase client
│   │   └── ...          # Other utilities
│   └── ...
├── .env.local           # Environment variables (not in git)
├── next.config.js
├── package.json
├── README.md
└── ...
```

## 👑 Creating an Admin Account

To create an admin account with permission to view all guestbook entries:

1. Register a regular account
2. From the Supabase dashboard, run the following SQL:

```sql
INSERT INTO public.admin_users (user_id) 
VALUES ('actual-account-uuid-here');
```

Replace `actual-account-uuid-here` with the actual UUID of the account you want to grant admin privileges to.

## 🔧 Customization and Extension

### Adding Music Tracks

#### Using the Admin Interface (Recommended)
Once you've set up an admin account, you can:
1. Log in as an admin
2. Navigate to the `/admin/music` page
3. Use the music upload form to add new tracks

#### Manual Method
1. Upload music files to the `songs` bucket in Supabase Storage
2. Add a new record to the `music_meta` table with:
   - `title`: Name of the song
   - `file_path`: Path to the file in the `songs` bucket

### Customizing the Interface

- Main components are in the `src/components/` directory
- Main styles are defined using Tailwind CSS
- Page transition effects are handled by `FullPageScroll.tsx`
- Music player visual effects can be customized in `AutoplayMusicPlayer.tsx`

### Tiếng Việt - Tùy chỉnh và mở rộng

#### Thêm bài nhạc
- Sử dụng giao diện admin tại `/admin/music` (khuyến nghị)
- Hoặc thêm thủ công vào bucket `songs` và bảng `music_meta`

#### Tùy chỉnh giao diện
- Các component chính nằm trong thư mục `src/components/`
- Hiệu ứng hình ảnh cho trình phát nhạc có thể tùy chỉnh trong `AutoplayMusicPlayer.tsx`

## 🔍 Troubleshooting

### English
- **Admin login errors**: Check information in `.env.local` and settings in Supabase
- **Infinite recursion in policy**: See instructions in `docs/fix-infinite-recursion.md`
- **Music upload errors**: Make sure the `songs` Storage bucket is properly set up and RLS policies are configured correctly
- **Autoplay not working**: Due to browser restrictions, autoplay requires user interaction. The player implements a fallback mechanism.

### Tiếng Việt - Xử lý sự cố
- **Lỗi đăng nhập admin**: Kiểm tra thông tin trong `.env.local` và thiết lập trong Supabase
- **Lỗi infinite recursion trong policy**: Xem hướng dẫn trong file `docs/fix-infinite-recursion.md`
- **Lỗi upload nhạc**: Đảm bảo bucket Storage `songs` đã được thiết lập đúng cách và RLS policies đã được cấu hình phù hợp
- **Tự động phát không hoạt động**: Do hạn chế của trình duyệt, tự động phát yêu cầu tương tác của người dùng. Trình phát thực hiện cơ chế dự phòng.

## 🎵 Music Player Features

### Advanced Audio Features
- **Autoplay**: Automatically starts playing music when the page loads (with fallback mechanisms for browser restrictions)
- **Cross-fade transitions**: Smooth 6-second transitions between tracks
- **Shuffle mode**: Tracks are shuffled on load and each track change plays a random track
- **Manual shuffle button**: Allows users to manually shuffle the playlist

### Visual Effects
- Multiple visual effect options (lines, circles, galaxy, etc.)
- Effects can be hidden on certain pages (like admin pages)
- Effects are synchronized with music transitions

## 📝 License

[MIT License](LICENSE)
