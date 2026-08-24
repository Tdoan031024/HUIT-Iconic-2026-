# 🚀 Hướng Dẫn Triển Khai (Deploy) Lên Hosting cPanel - HUIT ICONIC 2026

Tài liệu này cung cấp quy trình từng bước chuẩn hóa để triển khai website **HUIT's ICONIC 2026** lên môi trường **cPanel Node.js Selector**.

---

## 1. 📋 Chuẩn Bị Trước Khi Triển Khai

### Bước 1: Sao lưu dữ liệu hiện tại
Trước khi đóng gói mã nguồn, hãy chạy lệnh sao lưu database để đảm bảo an toàn:
```bash
node scripts/backup_mysql.js
```
File backup sẽ nằm trong thư mục `backups/`.

### Bước 2: Chuẩn bị file môi trường `.env` trên cPanel
Tạo file `.env` trên thư mục gốc của hosting với cấu hình MySQL từ cPanel:
```env
DATABASE_URL="mysql://cpanel_username:cpanel_password@127.0.0.1:3306/cpanel_dbname"
JWT_SECRET="huit-iconic-secure-secret-2026-production"
NEXT_PUBLIC_API_URL=""
NEXT_PUBLIC_SITE_URL="https://yourdomain.edu.vn"
NODE_ENV="production"
PORT=3000
```

---

## 2. 🗄️ Cấu Hình MySQL Trên cPanel

1. Đăng nhập vào cPanel ➔ Chọn **MySQL® Databases**.
2. **Tạo Database mới**: ví dụ `username_iconic2026`.
3. **Tạo User mới**: ví dụ `username_dbuser` và đặt mật khẩu mạnh.
4. **Gán User vào Database**: Chọn **ALL PRIVILEGES** (Toàn quyền).
5. Kiểm tra kết nối từ terminal cPanel hoặc chạy Prisma sync.

---

## 3. ⚙️ Thiết Lập Node.js App Trong cPanel

1. Trong cPanel, tìm mục **Software** ➔ Bấm chọn **Setup Node.js App**.
2. Bấm nút **Create Application**:
   * **Node.js version**: Chọn `18.x` hoặc `20.x LTS`.
   * **Application mode**: Chọn `Production`.
   * **Application root**: Điền đường dẫn thư mục mã nguồn (ví dụ: `iconic2026` hoặc `public_html`).
   * **Application URL**: Chọn tên miền website của bạn.
   * **Application startup file**: `server.js` (hoặc `node_modules/next/dist/bin/next` với đối số `start`).
3. Bấm **Create**.

---

## 4. 📦 Tải Lên Mã Nguồn & Cài Đặt Dependencies

1. Nén toàn bộ thư mục dự án thành file `.zip` (Loại trừ `node_modules`, `.next`, `.git`).
2. Vào **File Manager** trong cPanel ➔ Tải file `.zip` lên ➔ **Extract** (Giải nén).
3. Truy cập vào **Terminal** của cPanel (hoặc SSH):
   ```bash
   # Kích hoạt môi trường Node.js (Copy lệnh hiển thị ở đầu trang Setup Node.js App)
   source /home/username/nodevenv/iconic2026/20/bin/activate
   cd /home/username/iconic2026

   # Cài đặt thư viện
   npm install --production=false

   # Đồng bộ cấu trúc bảng vào MySQL cPanel
   npx prisma db push

   # Tạo thư mục lưu ảnh upload và phân quyền
   mkdir -p public/uploads
   chmod -R 755 public/uploads

   # Build dự án Next.js
   npm run build
   ```

---

## 5. 🔄 Khởi Động & Kiểm Tra Website

1. Quay lại trang **Setup Node.js App** trong cPanel ➔ Bấm nút **Restart Application**.
2. Mở trình duyệt truy cập tên miền của bạn để kiểm tra:
   * Trang chủ (`/`)
   * Bảng xếp hạng (`/bang-xep-hang`)
   * Trang quản trị (`/admin`)
3. Kiểm tra các chức năng:
   * Đăng nhập Admin (`Iconic2026.Huitmedia` / `Huit@media2019`)
   * Thêm/sửa thí sinh bằng kéo thả ảnh
   * Thùng rác Admin (`/admin/trash`)

---

## 6. 🛡️ Kiểm Tra Log Lỗi (Troubleshooting)

Nếu website gặp lỗi 500 hoặc 503 trên cPanel, kiểm tra file log:
1. File log của Node.js: `stderr.log` hoặc `stdout.log` trong thư mục ứng dụng.
2. File log của cPanel: `/home/username/logs/`.
3. Kiểm tra kết nối MySQL: đảm bảo `DATABASE_URL` trong `.env` sử dụng đúng `127.0.0.1:3306` hoặc `localhost`.
