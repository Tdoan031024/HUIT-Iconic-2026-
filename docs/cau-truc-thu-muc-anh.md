# Cấu trúc thư mục hình ảnh (Image Assets Directory Structure)

Dự án **HUIT's ICONIC 2026** tổ chức thư mục hình ảnh tại `public/images/` theo các nhóm chuyên biệt, rõ ràng và dễ quản lý:

```text
public/
├── images/
│   ├── logos/          # Logo nhận diện trường & cuộc thi
│   │   ├── huit_logo.png       # Logo Trường Đại học Công Thương TP.HCM
│   │   ├── logo_iconic.png     # Logo chính thức Cuộc thi HUIT's ICONIC 2026
│   │   ├── image.webp          # Logo hiển thị chuẩn trên Header
│   │   ├── site-logo.png       # Logo vuông dùng cho Admin / OG Meta / App
│   │   └── ieclogo.png         # Logo Trung tâm Tuyển sinh & Truyền thông
│   │
│   ├── socials/        # Biểu tượng mạng xã hội & liên hệ nhanh
│   │   ├── zalo.png            # Icon Zalo chat
│   │   ├── facebook.png        # Icon Facebook fanpage
│   │   ├── tiktok.png          # Icon TikTok
│   │   ├── instagram.png       # Icon Instagram
│   │   ├── telephone.png       # Icon hotline
│   │   └── mail.png            # Icon gửi email
│   │
│   ├── banners/        # Banner trang chủ, poster sự kiện & OG image
│   │   ├── baner.jpg           # Banner chính cuộc thi
│   │   ├── poster-khoi-nghiep.jpg # Poster giới thiệu chương trình
│   │   └── og-default.png      # Ảnh xem trước khi chia sẻ mạng xã hội
│   │
│   ├── sponsors/       # Logo của các đơn vị tài trợ & đồng hành
│   │   ├── logo-amangon.webp
│   │   ├── logo-mb-scaled.webp
│   │   └── ...
│   │
│   ├── ui/             # Đồ họa giao diện, huy hiệu, vòng nguyệt quế, icon phụ
│   │   ├── glowing_hourglass.png # Đồng hồ đếm ngược
│   │   ├── qrdangky.png          # Mã QR đăng ký
│   │   ├── laurel-dark-big.svg   # Vòng nguyệt quế vinh danh
│   │   └── laurel-light-big.svg
│   │
│   └── guides/         # Ảnh minh họa hướng dẫn các bước bình chọn
│       ├── dangnhap.png
│       ├── b2.png
│       └── b3.png
│
├── uploads/            # Thư mục lưu trữ các file tải lên động từ Admin Portal
└── favicon.png         # Favicon hiển thị trên tab trình duyệt
```

---

> 💡 **Lưu ý**: Để đảm bảo tương thích ngược 100% với các đường dẫn cũ và cơ sở dữ liệu đã lưu, toàn bộ các file tại thư mục gốc `public/images/` vẫn được duy trì đồng thời với các thư mục phân loại mới.
