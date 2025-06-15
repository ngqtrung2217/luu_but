# Hướng dẫn triển khai Lưu Bút lên Vercel

Trang web Lưu Bút có thể được dễ dàng triển khai lên Vercel với chỉ vài bước đơn giản.

## Yêu cầu trước khi triển khai

1. Đã tạo tài khoản [Vercel](https://vercel.com)
2. Đã tạo dự án [Supabase](https://supabase.com) và cấu hình theo hướng dẫn trong file `docs/supabase-schema.md`
3. Đã đẩy mã nguồn lên một repository Git (GitHub, GitLab, BitBucket)

## Các bước triển khai

### 1. Đăng nhập vào Vercel

Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và đăng nhập vào tài khoản của bạn.

### 2. Import dự án

Từ dashboard, nhấn vào nút "Add New" và chọn "Project".

### 3. Import Git Repository

Kết nối với nhà cung cấp Git của bạn (GitHub, GitLab, BitBucket) và chọn repository chứa mã nguồn Lưu Bút.

### 4. Cấu hình dự án

Trong trang cấu hình dự án, các thiết lập mặc định thường đã phù hợp, vì Next.js được Vercel hỗ trợ nguyên bản. Bạn chỉ cần:

1. Đặt tên dự án (tùy chọn)
2. Đảm bảo Framework Preset được thiết lập là "Next.js"

### 5. Cấu hình Environment Variables

Đây là bước quan trọng nhất. Trong phần "Environment Variables", thêm các biến môi trường sau:

- `NEXT_PUBLIC_SUPABASE_URL`: URL của dự án Supabase của bạn
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Khóa Anon/Public của dự án Supabase
- `NEXT_PUBLIC_FULLPAGE_LICENSE_KEY`: (Tùy chọn) Nếu bạn có giấy phép FullPage.js

### 6. Deploy

Nhấn nút "Deploy" và đợi quá trình triển khai hoàn tất. Vercel sẽ tự động build và triển khai trang web của bạn.

### 7. Kiểm tra

Sau khi quá trình triển khai hoàn tất, Vercel sẽ cung cấp một URL để truy cập trang web của bạn. Kiểm tra các tính năng để đảm bảo mọi thứ hoạt động bình thường.

### 8. Thiết lập tên miền tùy chỉnh (Tùy chọn)

Nếu bạn có tên miền riêng:

1. Từ trang dự án trên Vercel Dashboard, chọn "Settings" > "Domains"
2. Thêm tên miền của bạn và làm theo hướng dẫn để cấu hình DNS

## Cập nhật trang web

Mỗi khi bạn push thay đổi lên nhánh chính của repository, Vercel sẽ tự động triển khai phiên bản mới của trang web.

## Xử lý sự cố

Nếu gặp vấn đề trong quá trình triển khai:

1. Kiểm tra logs trên Vercel Dashboard
2. Đảm bảo các biến môi trường được cấu hình đúng
3. Kiểm tra kết nối với Supabase

Nếu bạn gặp lỗi khi triển khai, hãy kiểm tra log build trên Vercel để xem chi tiết lỗi.
