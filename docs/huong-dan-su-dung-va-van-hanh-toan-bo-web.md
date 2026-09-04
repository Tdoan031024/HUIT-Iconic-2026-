# SỔ TAY HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH TOÀN BỘ WEBSITE
## DỰ ÁN: HUIT'S ICONIC 2026
**Cổng thông tin & Hệ thống bình chọn Cuộc thi Nét đẹp Sinh viên Công Thương & Đại sứ Truyền thông HUIT 2026**

---

## MỤC LỤC
1. [TỔNG QUAN HỆ THỐNG & BẢN ĐỒ WEBSITE](#1-tổng-quan-hệ-thống--bản-đồ-website)
2. [HƯỚNG DẪN DÀNH CHO KHÁN GIẢ](#2-hướng-dẫn-dành-cho-khán-giả)
3. [HƯỚNG DẪN DÀNH CHO THÍ SINH](#3-hướng-dẫn-dành-cho-thí-sinh)
4. [HƯỚNG DẪN DÀNH CHO BAN TỔ CHỨC (ADMIN)](#4-hướng-dẫn-dành-cho-ban-tổ-chức-admin)
5. [HƯỚNG DẪN KỸ THUẬT, CẤU HÌNH & TRIỂN KHAI HOATING](#5-hướng-dẫn-kỹ-thuật-cấu-hình--triển-khai-hosting)
6. [XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)](#6-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. TỔNG QUAN HỆ THỐNG & BẢN ĐỒ WEBSITE

### 1.1 Mục tiêu hệ thống
Website **HUIT's ICONIC 2026** là cổng truyền thông và công nghệ chính thức của cuộc thi, phục vụ:
- Tiếp nhận hồ sơ thí sinh đăng ký dự thi trực tuyến.
- Cung cấp thể lệ, mốc thời gian, cơ cấu giải thưởng, ban giám khảo và tin tức sự kiện.
- Cổng bình chọn trực tuyến minh bạch, công bằng: tặng **02 lượt bình chọn miễn phí mỗi ngày** cho khán giả và tích hợp thanh toán quét mã QR tự động SePay.
- Hệ thống quản trị Admin tập trung: duyệt thí sinh, quản lý tài khoản khán giả, kích hoạt giờ vàng nhân điểm và đối soát giao dịch.

### 1.2 Bản đồ liên kết (Sitemap)

```text
┌── PUBLIC PAGES (Công chúng & Khán giả)
│   ├── /                          (Trang chủ: Hero, Countdown, Top thí sinh, Tin tức)
│   ├── /gioi-thieu                (Mục đích, quy mô, cơ cấu giải thưởng, quyền lợi)
│   ├── /the-le                    (Tiêu chuẩn tuyển sinh, 4 vòng thi, cách thức tính điểm)
│   ├── /thoi-gian                 (Mốc thời gian từng vòng, bộ đếm ngược)
│   ├── /thi-sinh                  (Danh sách thí sinh, bộ lọc Bảng King/Queen, tìm kiếm)
│   ├── /thi-sinh/[sbd]            (Chi tiết hồ sơ, số đo, 4 tiêu chí đại sứ, album ảnh)
│   ├── /bang-xep-hang             (Bục vinh danh Podium Top 3, xếp hạng thời gian thực)
│   ├── /dang-ky                   (Form nộp hồ sơ thí sinh dự thi trực tuyến)
│   └── /dang-nhap                 (Đăng nhập khán giả & Modal Đăng ký nhận 2 vote/ngày)
│
└── ADMIN PORTAL (Ban Tổ Chức)
    ├── /admin/login               (Đăng nhập quản trị viên)
    ├── /admin                     (Dashboard tổng quan: thống kê thí sinh, vote, người dùng)
    ├── /admin/candidates          (Quản lý thí sinh: thêm, sửa, đổi vote, xuất Excel)
    ├── /admin/registrations       (Duyệt hồ sơ thí sinh đăng ký trực tuyến cấp SBD)
    ├── /admin/users               (Quản lý tài khoản khán giả: đối tượng, Khoa, MSSV)
    ├── /admin/promotions          (Cấu hình sự kiện Giờ Vàng nhân điểm vote x2, x3)
    ├── /admin/settings            (Cài đặt cổng bình chọn, lượt vote miễn phí, Turnstile)
    ├── /admin/guides              (Cấu hình nội dung hướng dẫn bình chọn & biểu phí)
    ├── /admin/introduction        (Cấu hình nội dung trang Giới thiệu)
    └── /admin/timeline            (Cấu hình mốc thời gian lịch trình)
```

---

## 2. HƯỚNG DẪN DÀNH CHO KHÁN GIẢ

### 2.1 Tạo tài khoản Khán giả mới
1. Truy cập trang [**Đăng nhập Khán giả**](http://localhost:3000/dang-nhap) (`/dang-nhap`).
2. Bấm vào nút **"Đăng ký ngay"** để mở modal tạo tài khoản.
3. Nhập thông tin:
   - **Họ và tên**: Họ tên đầy đủ của khán giả.
   - **Email & Mật khẩu**: Email đăng nhập và mật khẩu (tối thiểu 6 ký tự).
   - **Bạn là**: Chọn 1 trong 4 nhóm đối tượng:
     - *Sinh viên HUIT*: Tự động hiện danh sách chọn **Khoa / Viện** và ô nhập **MSSV**.
     - *Cán bộ / Giảng viên HUIT*: Tự động hiện danh sách chọn **Khoa / Viện**.
     - *Cựu sinh viên HUIT*: Tự động hiện danh sách chọn **Khoa / Viện**.
     - *Khán giả tự do*: Không cần chọn trường/khoa.
   - **Bảng thi quan tâm**: Chọn *HUIT's Queen (Nữ)*, *HUIT's King (Nam)* hoặc *Cả hai bảng*.
4. Bấm **"Tạo tài khoản khán giả"**. Hệ thống tự động kích hoạt tài khoản và đăng nhập ngay.

> [!TIP]
> **Quyền lợi khán giả**: Mỗi tài khoản khán giả sau khi đăng nhập được cấp **02 lượt bình chọn miễn phí mỗi ngày** (hệ thống tự động làm mới hạn mức vào 00:00 mỗi đêm).

### 2.2 Đăng nhập nhanh bằng Google
- Tại trang `/dang-nhap`, bấm nút **"Đăng nhập với Google"**.
- Có thể sử dụng Gmail cá nhân hoặc tài khoản email trường `@huit.edu.vn`. Hệ thống tự động tạo tài khoản và đồng bộ avatar.

### 2.3 Cách tìm kiếm & Xem thông tin thí sinh
1. Vào mục [**Thí sinh**](http://localhost:3000/thi-sinh).
2. Lọc theo bảng thi: Bấm tab **"HUIT's King"** để xem thí sinh nam hoặc **"HUIT's Queen"** để xem thí sinh nữ.
3. Nhập tên hoặc Số báo danh (SBD) vào thanh tìm kiếm để tìm nhanh.
4. Bấm vào thẻ thí sinh để xem chi tiết:
   - Hồ sơ nhân trắc học: Chiều cao, cân nặng, số đo 3 vòng.
   - Khoa/Viện, Lớp, Mã số sinh viên.
   - 4 nhóm tiêu chí đánh giá cốt lõi: Phong thái sân khấu, Kỹ năng ứng xử, Dự án thiện nguyện, Tiềm năng Đại sứ truyền thông.
   - Bấm vào bất kỳ ảnh nào để mở chế độ xem ảnh toàn màn hình (Lightbox) sắc nét.

### 2.4 Cách thực hiện Bình chọn miễn phí
1. Tại trang chi tiết thí sinh, bấm nút **"Bình chọn ngay"**.
2. Modal bình chọn mở ra hiển thị số lượt miễn phí còn lại trong ngày (VD: `2/2 lượt`).
3. Bấm **"Xác nhận bình chọn miễn phí"**.
4. Hệ thống ghi nhận ngay lập tức, điểm của thí sinh tăng lên +1 và hiển thị thông báo chúc mừng.

### 2.5 Cách ủng hộ thêm điểm bình chọn qua SePay (nếu có)
1. Trong modal bình chọn, chọn gói điểm mong muốn (VD: 5 điểm, 10 điểm, 50 điểm...).
2. Bấm **"Tiếp tục thanh toán"**.
3. Màn hình xuất hiện mã **VietQR**:
   - Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, MoMo...).
   - Quét mã QR hiển thị trên màn hình (đã chứa sẵn số tiền và mã giao dịch).
   - Xác nhận chuyển khoản trên app ngân hàng.
4. Cổng thanh toán SePay tự động bắn webhook về server trong 3 - 5 giây, hệ thống tự động cộng điểm cho thí sinh mà không cần tải lại trang.

### 2.6 Tận dụng Khung Giờ Vàng (Golden Hours)
- Khi Ban Tổ Chức kích hoạt Giờ Vàng, trên trang web và modal bình chọn sẽ xuất hiện biểu tượng **"🔥 Giờ vàng: x2 (hoặc x3) điểm bình chọn"**.
- Trong khung giờ này, mỗi lượt bình chọn miễn phí hoặc có phí đều được nhân đôi hoặc nhân ba số điểm cho thí sinh.

---

## 3. HƯỚNG DẪN DÀNH CHO THÍ SINH

### 3.1 Điều kiện & Tiêu chuẩn dự thi
- Là sinh viên đang theo học chính quy tại Trường Đại học Công Thương TP.HCM (HUIT).
- Điểm rèn luyện từ 70 điểm trở lên, không vi phạm kỷ luật.
- **Bảng Nam (HUIT's King)**: Chiều cao từ 1m68 trở lên.
- **Bảng Nữ (HUIT's Queen)**: Chiều cao từ 1m58 trở lên.

### 3.2 Quy trình nộp hồ sơ trực tuyến (`/dang-ky`)
1. Truy cập [**Trang Đăng ký Thí sinh**](http://localhost:3000/dang-ky).
2. Điền đầy đủ các mục thông tin:
   - **Thông tin cơ bản**: Họ và tên, Ngày sinh, Giới tính, Bảng thi (*King* hoặc *Queen*).
   - **Thông tin học tập**: Khoa / Viện, Lớp sinh hoạt, Mã số sinh viên (MSSV).
   - **Liên hệ**: Số điện thoại, Email, Link Facebook/TikTok cá nhân.
   - **Chỉ số hình thể**: Chiều cao (cm), Cân nặng (kg), Số đo 3 vòng (Ngực - Eo - Mông).
   - **Hồ sơ năng khiếu & thế mạnh**: Tài năng sở trường (hát, múa, MC, ngoại ngữ, catwalk...), sở thích cá nhân, các thành tích nổi bật đã đạt được.
   - **Thông điệp truyền cảm hứng**: Trả lời câu hỏi *"Tại sao bạn xứng đáng trở thành Đại sứ Truyền thông HUIT 2026?"*.
   - **Ảnh & Video**:
     - Tải lên 01 ảnh chân dung (chính diện, rõ nét mặt).
     - Tải lên 01 ảnh toàn thân (thấy rõ vóc dáng).
     - Dán link video clip giới thiệu bản thân / tài năng (link TikTok, YouTube hoặc Google Drive công khai).
3. Đọc kỹ cam kết cuộc thi và bấm **"Gửi hồ sơ đăng ký"**.
4. Hệ thống cấp **Mã hồ sơ đăng ký** (VD: `REG-2026-XXXX`). Lưu lại mã này để liên hệ BTC khi cần.

### 3.3 Sau khi nộp hồ sơ
- Ban Tổ Chức sẽ kiểm tra tính hợp lệ của hồ sơ trong vòng 24 - 48h.
- Khi hồ sơ được duyệt, thí sinh sẽ nhận được email thông báo kèm **Số báo danh (SBD)** chính thức và hồ sơ sẽ xuất hiện trên trang bình chọn công khai.

---

## 4. HƯỚNG DẪN DÀNH CHO BAN TỔ CHỨC (ADMIN)

### 4.1 Đăng nhập Cổng Quản trị Admin
1. Truy cập đường dẫn: [`/admin/login`](http://localhost:3000/admin/login).
2. Nhập email và mật khẩu tài khoản có quyền `ADMIN`.
3. Bấm **"Đăng nhập"** để vào hệ thống điều hành.

### 4.2 Tiếp nhận & Duyệt đơn đăng ký thí sinh (`/admin/registrations`)
1. Vào menu **Đơn đăng ký** (`/admin/registrations`).
2. Danh sách hiển thị các hồ sơ mới nộp từ form `/dang-ky`.
3. Bấm vào từng đơn để xem chi tiết:
   - Xem ảnh chân dung, ảnh toàn thân, thông số hình thể, video clip sơ khảo.
   - Kiểm tra MSSV, Khoa/Viện.
4. Thao tác xử lý:
   - **Phê duyệt (Approve)**: Nhập Số báo danh (SBD) cấp cho thí sinh (VD: `012`, `105`) -> Bấm duyệt -> Hệ thống tự động tạo hồ sơ thí sinh chính thức trên cổng bình chọn.
   - **Từ chối (Reject)**: Nhập lý do từ chối (VD: Không đúng tiêu chuẩn chiều cao, ảnh mờ không hợp lệ) để lưu vết hệ thống.

### 4.3 Quản lý Hồ sơ Thí sinh (`/admin/candidates`)
- **Thêm thí sinh thủ công**: Bấm nút **"Thêm thí sinh"**, điền thông tin, chọn Bảng thi (King/Queen), Vòng thi (Sơ khảo/Bán kết/Chung kết) và tải ảnh.
- **Chỉnh sửa hồ sơ**:
  - Bấm nút **"Sửa"** bên cạnh thí sinh.
  - Cập nhật lại số đo, ảnh đại diện, ảnh album, thêm link video clip biểu diễn.
  - Có thể điều chỉnh điểm số vote thủ công nếu có quyết định cộng điểm thưởng từ Ban Giám Khảo.
- **Ẩn / Xóa thí sinh**: Nếu thí sinh xin rút lui khỏi cuộc thi, có thể chuyển trạng thái sang *Ẩn* hoặc *Xóa* khỏi cổng bình chọn.
- **Xuất dữ liệu Excel/CSV**: Bấm nút **"Xuất danh sách"** để tải file Excel phục vụ báo cáo cho Hội đồng Ban Giám khảo.

### 4.4 Quản lý Khán giả / Người dùng (`/admin/users`)
1. Vào menu **Người dùng** (`/admin/users`).
2. Theo dõi danh sách tài khoản khán giả tham gia bình chọn.
3. Bấm nút **"Chi tiết"** để xem:
   - Khán giả thuộc nhóm đối tượng nào (*Sinh viên HUIT, Giảng viên, Cựu sinh viên, Tự do*).
   - Khoa / Viện và MSSV của khán giả.
   - Bảng thi mà khán giả quan tâm (*HUIT's King hay HUIT's Queen*).
4. Thao tác:
   - Có thể nâng cấp tài khoản thành Admin hoặc chuyển về User.
   - Khóa (Disable) tài khoản nếu phát hiện hành vi spam, gian lận vote.

### 4.5 Cài đặt Giờ Vàng nhân điểm (`/admin/promotions`)
1. Vào menu **Sự kiện / Giờ vàng** (`/admin/promotions`).
2. Bấm **"Tạo sự kiện Giờ Vàng"**:
   - Tên sự kiện (VD: *Giờ vàng Bán kết - Tiếp sức Thí sinh HUIT*).
   - Hệ số nhân: `x2` hoặc `x3`.
   - Khung giờ: Chọn ngày giờ bắt đầu và ngày giờ kết thúc.
3. Bấm **"Kích hoạt"**. Khi đến giờ quy định, hệ thống tự động nhân hệ số điểm cho tất cả các lượt bình chọn.

### 4.6 Cài đặt Hệ thống cốt lõi (`/admin/settings`)
Vào menu **Cài đặt** (`/admin/settings`):
- **Cổng bình chọn**: Bật/tắt công tắc *Mở cổng bình chọn* (khi đóng cổng, khán giả không thể vote).
- **Cổng đăng ký dự thi**: Bật/tắt tiếp nhận hồ sơ thí sinh mới.
- **Số lượt bình chọn miễn phí mỗi ngày**: Mặc định là `2` lượt/tài khoản/ngày (có thể đổi thành 1, 3, 5 tùy giai đoạn cuộc thi).
- **Cấu hình chống bot Cloudflare Turnstile**: Điền Site Key & Secret Key để bảo vệ cổng vote.
- **Cấu hình ngân hàng SePay**: Điền thông tin số tài khoản nhận ủng hộ, tên ngân hàng và API Token.

---

## 5. HƯỚNG DẪN KỸ THUẬT, CẤU HÌNH & TRIỂN KHAI HOSTING

### 5.1 Cấu hình Biến Môi trường (`.env`)
File cấu hình `.env` tại thư mục gốc dự án:
```bash
# Cổng kết nối cơ sở dữ liệu MySQL
DATABASE_URL="mysql://username:password@localhost:3306/huit_iconic_2026_db"

# Bảo mật NextAuth Session
NEXTAUTH_URL="http://localhost:3000" # Đổi thành https://iconic.huit.edu.vn khi lên production
NEXTAUTH_SECRET="your-super-strong-jwt-secret-key-iconic-2026"

# Cấu hình Đăng nhập Google (Tạo trên Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cấu hình Chống bot Cloudflare Turnstile (Tạo trên Cloudflare Dashboard)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."

# Cấu hình Cổng thanh toán chuyển khoản tự động SePay
SEPAY_API_TOKEN="your-sepay-api-token"
SEPAY_WEBHOOK_URL="https://iconic.huit.edu.vn/api/sepay/webhook"
```

### 5.2 Lệnh chạy kiểm tra trên máy phát triển (Localhost)
```bash
# Cài đặt thư viện phụ thuộc
npm install

# Đồng bộ cấu trúc Database Prisma
npx prisma db push

# Khởi chạy máy chủ phát triển
npm run dev
# Truy cập: http://localhost:3000

# Kiểm tra lỗi cú pháp và kiểu dữ liệu TypeScript
npx tsc --noEmit
```

### 5.3 Triển khai lên Hosting cPanel / VPS Production

#### Cách 1: Tự động hóa qua GitHub Actions CI/CD (Khuyên dùng)
Dự án đã tích hợp sẵn GitHub Actions workflow tại `.github/workflows/cpanel-deploy.yml`:
1. Mỗi khi Ban Quản Trị `git push` code lên nhánh `main`, GitHub Actions sẽ tự động:
   - Kiểm tra mã nguồn và chạy lệnh `npm run build`.
   - Đóng gói toàn bộ mã nguồn sạch và tự động đẩy lên Hosting cPanel qua FTP/SSH.
   - Khởi động lại ứng dụng Node.js trên cPanel.

#### Cách 2: Triển khai thủ công trên Hosting cPanel (Node.js App)
1. Truy cập **cPanel > Setup Node.js App**.
2. Chọn Node.js version `18.x` hoặc `20.x`.
3. Application Root: thư mục chứa mã nguồn web.
4. Application Startup File: `server.js` hoặc cấu hình script `npm run start`.
5. Tạo cơ sở dữ liệu MySQL trong **cPanel > MySQL Databases**, gán user và cấp full quyền.
6. Import cấu trúc bảng từ Prisma hoặc chạy `npx prisma db push` trong cPanel Terminal.

---

## 6. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện tượng sự cố | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| Khán giả không bình chọn được lượt miễn phí | - Chưa đăng nhập tài khoản khán giả.<br>- Đã dùng hết 2 lượt trong ngày.<br>- Cổng bình chọn đang bị đóng trong Admin Settings. | - Bấm Đăng nhập hoặc tạo tài khoản mới.<br>- Kiểm tra thông báo quota còn lại.<br>- Vào Admin > Cài đặt kiểm tra xem công tắc *Mở cổng bình chọn* đã bật chưa. |
| Thí sinh đã nộp hồ sơ nhưng không thấy hiển thị trên web | Hồ sơ mới nộp ở trạng thái *Chờ duyệt (Pending)*, chưa được cấp SBD. | Admin vào `/admin/registrations`, xem hồ sơ và bấm nút **"Phê duyệt"** để cấp SBD. |
| Không chuyển khoản được qua mã QR SePay | Chưa cấu hình đúng số tài khoản ngân hàng hoặc API SePay hết hạn. | Vào `/admin/settings` kiểm tra lại số tài khoản, tên ngân hàng và mã Token SePay. |
| Bị chặn khi truy cập trang `/admin` | Tài khoản chưa đăng nhập hoặc không có quyền `ADMIN`. | Đăng nhập đúng tài khoản Admin tại `/admin/login`. Nếu quên mật khẩu, có thể chỉnh cột `role = 'ADMIN'` trực tiếp trong bảng `webuser` qua phpMyAdmin. |
| Báo lỗi kết nối Database | Sai thông tin chuỗi kết nối `DATABASE_URL` trong file `.env`. | Kiểm tra lại username, password, host, port và tên database MySQL. |

---

> [!NOTE]
> **Đơn vị đầu mối hỗ trợ kỹ thuật cuộc thi HUIT's ICONIC 2026**:
> - Đơn vị phụ trách: Trung tâm Tuyển sinh & Truyền thông Trường Đại học Công Thương TP.HCM (HUIT).
> - Email: `media@huit.edu.vn`
> - Tài liệu này được lưu trữ và cập nhật liên tục tại thư mục: `docs/huong-dan-su-dung-va-van-hanh-toan-bo-web.md`.
