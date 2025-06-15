# Supabase Database Schema

## Hướng dẫn thiết lập Schema trong Supabase

Đây là hướng dẫn cách tạo các bảng cần thiết trong Supabase để website Lưu bút hoạt động.

### 1. Bảng `luubut`

Bảng này lưu trữ các lưu bút được gửi bởi người dùng.

**SQL để tạo bảng:**

```sql
CREATE TABLE public.luubut (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Người bạn ẩn danh',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Thiết lập RLS (Row Level Security) để người dùng chỉ có thể thêm mới nhưng không đọc được lưu bút:
ALTER TABLE public.luubut ENABLE ROW LEVEL SECURITY;

-- Chỉ cho phép thêm mới (không đọc được)
CREATE POLICY "Allow public to insert only" ON public.luubut
  FOR INSERT WITH CHECK (true);

-- Chỉ admin mới được xem tất cả
CREATE POLICY "Allow admin to select all" ON public.luubut
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );
```

### 2. Bảng `admin_users`

Bảng này lưu trữ danh sách các user có quyền admin (có quyền xem tất cả lưu bút).

**SQL để tạo bảng:**

```sql
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tạo index để tìm kiếm nhanh
CREATE INDEX admin_users_user_id_idx ON public.admin_users (user_id);

-- Thiết lập RLS để bảo vệ bảng admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Chỉ admin mới có quyền xem bảng admin_users
CREATE POLICY "Allow admin to select" ON public.admin_users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );
```

### 3. Bảng `music_meta`

Bảng này lưu trữ thông tin về các bài nhạc được sử dụng trong website.

**SQL để tạo bảng:**

```sql
CREATE TABLE public.music_meta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cho phép tất cả người dùng xem thông tin bài nhạc
ALTER TABLE public.music_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to select" ON public.music_meta
  FOR SELECT USING (true);

-- Chỉ admin mới có quyền thêm/sửa/xoá
CREATE POLICY "Allow admin to insert, update, delete" ON public.music_meta
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );
```

### 4. Thiết lập Storage Buckets

Để lưu trữ các file âm nhạc, bạn cần tạo bucket "songs" trong Supabase Storage:

1. Truy cập vào phần "Storage" trong dashboard Supabase
2. Tạo bucket mới có tên là "songs"
3. Thiết lập quyền public cho bucket:

```sql
-- Cho phép tất cả mọi người đọc file nhạc
CREATE POLICY "Allow public to select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'songs'
  );

-- Chỉ admin mới có quyền thêm/sửa/xóa file nhạc
CREATE POLICY "Allow admin to insert, update, delete" ON storage.objects
  FOR ALL USING (
    bucket_id = 'songs' AND
    auth.uid() IN (
      SELECT user_id FROM public.admin_users
    )
  );
```

## Cách thiết lập tài khoản admin

1. Đăng ký một tài khoản mới thông qua Authentication của Supabase
2. Lấy UUID của tài khoản vừa tạo
3. Chạy SQL sau để thêm tài khoản đó làm admin:

```sql
INSERT INTO public.admin_users (user_id) 
VALUES ('229aaf50-1fb9-4ba7-9a0a-b1bf2410f648');
```

Sau khi thiết lập xong, tài khoản admin có thể xem tất cả lưu bút và quản lý file nhạc.
