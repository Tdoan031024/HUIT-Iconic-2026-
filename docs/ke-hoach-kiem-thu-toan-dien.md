# KẾ HOẠCH KIỂM THỬ TOÀN DIỆN HỆ THỐNG WEBSITE
## DỰ ÁN: HUIT'S ICONIC 2026
**Cuộc thi Nét đẹp Sinh viên Công Thương & Tìm kiếm Đại sứ Truyền thông HUIT 2026**

---

## I. MỤC TIÊU & PHẠM VI KIỂM THỬ

### 1. Mục tiêu
- Đảm bảo 100% các luồng nghiệp vụ hoạt động chính xác, ổn định và không phát sinh lỗi trước khi công bố rộng rãi.
- Đảm bảo tính công bằng, minh bạch và an toàn tuyệt đối cho cổng bình chọn (chống gian lận, chống bot/spam vote).
- Đảm bảo trải nghiệm người dùng (UX/UI) mượt mà trên mọi thiết bị (máy tính, máy tính bảng, điện thoại di động).
- Đảm bảo quy trình tiếp nhận hồ sơ thí sinh và xét duyệt trong Admin diễn ra thông suốt.

### 2. Phạm vi kiểm thử
1. **Phân hệ Khán giả & Công chúng (Public Pages)**
2. **Phân hệ Đăng ký Thí sinh (Candidate Registration)**
3. **Phân hệ Xác thực & Tài khoản Khán giả (Authentication & Profiles)**
4. **Phân hệ Cổng Bình chọn & Giao dịch (Voting & Sepay Engine)**
5. **Phân hệ Quản trị viên (Admin Management & Dashboard)**
6. **Kiểm thử Phi chức năng (Bảo mật, Hiệu năng, Tương thích thiết bị)**

---

## II. MA TRẬN KỊCH BẢN KIỂM THỬ (TEST CASES CHI TIẾT)

### PHẦN 1: PHÂN HỆ KHÁN GIẢ & GIAO DIỆN CÔNG CHÚNG

| Mã TC | Hạng mục / Chức năng | Các bước thực hiện (Test Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-PUB-01** | **Trang chủ (`/`) - Điều hướng & Giao diện** | 1. Truy cập URL `/`<br>2. Kiểm tra Header, Hero Banner, Video giới thiệu, Countdown, Top thí sinh.<br>3. Bấm vào các link menu: *Giới thiệu, Thể lệ, Lịch trình, Thí sinh, Bảng xếp hạng*. | - Giao diện hiển thị sắc nét, hình ảnh load nhanh.<br>- Menu điều hướng đúng các trang con tương ứng. | [ ] |
| **TC-PUB-02** | **Trang chủ - Nút Đăng ký dự thi** | 1. Tại Hero Banner, click nút *"Đăng ký tham gia ngay"*.<br>2. Tại thanh Sticky Header, click nút *"Đăng ký"*. | Chuyển hướng chính xác về URL [`/dang-ky`](http://localhost:3000/dang-ky). Không bị chuyển link ngoài hay lỗi 404. | [ ] |
| **TC-PUB-03** | **Đa ngôn ngữ (VI / EN)** | 1. Bấm nút chuyển đổi ngôn ngữ (VI/EN) ở góc trên bên phải.<br>2. Quan sát toàn bộ tiêu đề, menu, phụ đề. | Tất cả nhãn, tiêu đề, nút bấm chuyển đổi mượt mà giữa Tiếng Việt và Tiếng Anh, không bị vỡ layout. | [ ] |
| **TC-PUB-04** | **Chế độ Sáng / Tối (Dark/Light Mode)** | 1. Bấm biểu tượng đổi Theme (Mặt trời/Mặt trăng).<br>2. Kiểm tra độ tương phản văn bản, màu nền card, bảng xếp hạng. | Chuyển theme êm, văn bản không bị chìm nền, giữ nguyên trạng thái khi reload trang. | [ ] |
| **TC-PUB-05** | **Trang Thể lệ (`/the-le`)** | 1. Truy cập `/the-le`.<br>2. Kiểm tra 4 vòng thi: *Sơ tuyển, Bán kết, Nhà chung/Thiện nguyện, Chung kết*.<br>3. Bấm nút *"Đăng ký dự thi ngay →"*. | - Đầy đủ tiêu chuẩn tuyển sinh Bảng Nam (King) & Bảng Nữ (Queen).<br>- Nút CTA chuyển thẳng vào form `/dang-ky`. | [ ] |
| **TC-PUB-06** | **Trang Lịch trình (`/thoi-gian`)** | 1. Truy cập `/thoi-gian`.<br>2. Kiểm tra các mốc thời gian từng vòng, bộ đếm ngược.<br>3. Bấm nút *"Đăng ký dự thi ngay"*. | Bộ đếm thời gian chạy chính xác; nút đăng ký dẫn về `/dang-ky`. | [ ] |
| **TC-PUB-07** | **Trang Danh sách Thí sinh (`/thi-sinh`)** | 1. Lọc theo tab Bảng: *Tất cả*, *HUIT's King (Nam)*, *HUIT's Queen (Nữ)*.<br>2. Lọc theo Vòng thi: *Sơ loại, Bán kết, Chung kết*.<br>3. Tìm kiếm theo tên hoặc SBD (VD: gõ "001" hoặc tên thí sinh).<br>4. Thử tính năng sắp xếp: *Bình chọn nhiều nhất, SBD tăng dần*. | - Danh sách thí sinh lọc đúng theo tiêu chí.<br>- Thanh tìm kiếm trả kết quả tức thì không giật lag.<br>- Phân trang/cuộn trang hoạt động tốt. | [ ] |
| **TC-PUB-08** | **Trang Chi tiết Thí sinh (`/thi-sinh/[sbd]`)** | 1. Click vào một thí sinh (VD: `/thi-sinh/001`).<br>2. Kiểm tra hiển thị: Ảnh đại diện, Tên, SBD, Khoa, Lớp, MSSV, Bảng thi, Số đo 3 vòng, Chiều cao, Cân nặng.<br>3. Kiểm tra 4 thẻ tiêu chí nổi bật (Phong thái, Ứng xử, Thiện nguyện, Đại sứ).<br>4. Click vào ảnh trong thư viện để mở Lightbox phóng to, bấm Next/Prev/Esc.<br>5. Bấm nút *"Bình chọn ngay"*. | - Đầy đủ hồ sơ cá nhân theo đúng format Đại sứ HUIT's ICONIC.<br>- Thư viện ảnh mở popup xem sắc nét, điều hướng phím mũi tên mượt.<br>- Nút mở modal bình chọn thành công. | [ ] |
| **TC-PUB-09** | **Trang Bảng xếp hạng (`/bang-xep-hang`)** | 1. Truy cập `/bang-xep-hang`.<br>2. Kiểm tra Bục vinh danh Podium Top 3 (Vàng, Bạc, Đồng).<br>3. Chuyển đổi tab Bảng Nam (King) và Bảng Nữ (Queen).<br>4. Thử tìm kiếm nhanh thí sinh trên bảng xếp hạng. | Thứ hạng (Hạng 1, 2, 3...) và số điểm vote cập nhật chuẩn xác, phân loại rõ ràng theo bảng thi. | [ ] |

---

### PHẦN 2: PHÂN HỆ ĐĂNG KÝ DỰ THI THÍ SINH (`/dang-ky`)

| Mã TC | Hạng mục / Chức năng | Các bước thực hiện (Test Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-REG-01** | **Validate trường bắt buộc** | 1. Truy cập `/dang-ky`.<br>2. Để trống các ô và bấm *"Gửi hồ sơ đăng ký"*. | Hệ thống cảnh báo đỏ tại các ô bắt buộc: Họ tên, Số điện thoại, Email, Khoa, Bảng thi, Ảnh chân dung. | [ ] |
| **TC-REG-02** | **Validate định dạng dữ liệu** | 1. Nhập Email sai định dạng (thiếu @).<br>2. Nhập Số điện thoại không đủ 10 số.<br>3. Nhập Chiều cao, Cân nặng bằng chữ. | Hiển thị thông báo lỗi tương ứng, không cho gửi form. | [ ] |
| **TC-REG-03** | **Upload Ảnh & Video** | 1. Tải lên 01 ảnh chân dung & 01 ảnh toàn thân (định dạng JPG/PNG/WEBP).<br>2. Nhập đường dẫn link video TikTok / YouTube dự thi sơ khảo.<br>3. Kiểm tra preview ảnh sau khi chọn file. | Ảnh hiển thị preview ngay lập tức; dung lượng ảnh được tối ưu nén trước khi upload. | [ ] |
| **TC-REG-04** | **Gửi hồ sơ đăng ký thành công** | 1. Nhập đầy đủ thông tin hợp lệ.<br>2. Bấm *"Gửi hồ sơ đăng ký"*. | - Hiển thị màn hình thông báo: *"Đăng ký thành công! Hồ sơ của bạn đang được Ban Tổ Chức xét duyệt" kèm mã hồ sơ.<br>- Dữ liệu lập tức xuất hiện trong trang Admin Quản lý Đăng ký. | [ ] |

---

### PHẦN 3: XÁC THỰC & ĐĂNG KÝ KHÁN GIẢ (`/dang-nhap`)

| Mã TC | Hạng mục / Chức năng | Các bước thực hiện (Test Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | **Mở Modal Đăng ký Khán giả** | 1. Truy cập `/dang-nhap`.<br>2. Bấm link *"Đăng ký ngay"*.<br>3. Đọc thông điệp quyền lợi: *"Nhận 02 lượt bình chọn miễn phí mỗi ngày"*. | Modal mở lên chuyên nghiệp, hiển thị đầy đủ thông tin quyền lợi dành riêng cho khán giả. | [ ] |
| **TC-AUTH-02** | **Form Khán giả - Chọn đối tượng** | 1. Mở dropdown *"Bạn là"*, chọn lần lượt:<br>   - *Sinh viên HUIT*<br>   - *Cán bộ / Giảng viên HUIT*<br>   - *Cựu sinh viên HUIT*<br>   - *Khán giả tự do* | - Khi chọn nhóm thuộc HUIT: Tự động hiện dropdown 16+ Khoa / Viện.<br>- Khi chọn *Sinh viên HUIT*: Hiện thêm ô nhập MSSV.<br>- Khi chọn *Khán giả tự do*: Ẩn các ô liên quan đến trường. | [ ] |
| **TC-AUTH-03** | **Đăng ký tài khoản Khán giả mới** | 1. Điền Họ tên, Email mới, Mật khẩu (>= 6 ký tự).<br>2. Chọn Đối tượng: Sinh viên HUIT -> Chọn Khoa CNTT -> Nhập MSSV.<br>3. Chọn Bảng thi quan tâm: *Cả hai bảng (King & Queen)*.<br>4. Bấm *"Tạo tài khoản khán giả"*. | - Đăng ký thành công, tự động đăng nhập và lưu session.<br>- Header cập nhật tên và avatar khán giả.<br>- Dữ liệu trong DB có đầy đủ `audienceType`, `faculty`, `studentId`. | [ ] |
| **TC-AUTH-04** | **Đăng nhập Email & Mật khẩu** | 1. Đăng xuất tài khoản.<br>2. Tại `/dang-nhap`, nhập email & mật khẩu vừa tạo.<br>3. Bấm *"Đăng nhập"*. | Đăng nhập thành công, chuyển hướng về trang trước đó hoặc trang chủ. | [ ] |
| **TC-AUTH-05** | **Đăng nhập sai thông tin** | 1. Nhập email đúng nhưng sai mật khẩu.<br>2. Nhập email không tồn tại. | Hệ thống báo lỗi rõ ràng: *"Email hoặc mật khẩu không chính xác"*. | [ ] |
| **TC-AUTH-06** | **Link chuyển hướng cho Thí sinh** | Tại trang `/dang-nhap` và trong Modal Đăng ký khán giả, click link *"Bạn là thí sinh muốn đăng ký dự thi? Đăng ký ngay →"*. | Chuyển hướng ngay sang `/dang-ky`. | [ ] |

---

### PHẦN 4: CỔNG BÌNH CHỌN (VOTING ENGINE & TRANSACTIONS)

| Mã TC | Hạng mục / Chức năng | Các bước thực hiện (Test Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-VOTE-01** | **Bình chọn khi Chưa đăng nhập** | 1. Đăng xuất tài khoản.<br>2. Vào xem thí sinh bất kỳ, bấm nút *"Bình chọn"*. | Modal hiển thị yêu cầu đăng nhập kèm nút *"Đăng nhập để nhận 2 lượt bình chọn miễn phí mỗi ngày"*. | [ ] |
| **TC-VOTE-02** | **Bình chọn miễn phí (Lần 1 trong ngày)** | 1. Đăng nhập tài khoản khán giả.<br>2. Mở modal bình chọn thí sinh.<br>3. Kiểm tra quota: Hiển thị *"Hôm nay bạn còn 2/2 lượt miễn phí"*.<br>4. Bấm nút *"Xác nhận bình chọn miễn phí"*. | - Thông báo bình chọn thành công.<br>- Số vote của thí sinh tăng ngay +1 điểm.<br>- Hạn mức giảm xuống còn 1/2 lượt. | [ ] |
| **TC-VOTE-03** | **Bình chọn miễn phí (Lần 2 trong ngày)** | 1. Bình chọn tiếp cho thí sinh đó hoặc thí sinh khác.<br>2. Bấm *"Xác nhận bình chọn"*. | - Bình chọn thành công, điểm cộng thêm +1.<br>- Hạn mức giảm về 0/2 lượt. | [ ] |
| **TC-VOTE-04** | **Chặn bình chọn khi Hết lượt miễn phí** | 1. Sau khi dùng hết 2 lượt, tiếp tục bấm bình chọn miễn phí. | Nút bình chọn miễn phí bị vô hiệu hóa (disabled), hiển thị thông báo *"Bạn đã sử dụng hết lượt bình chọn miễn phí hôm nay. Vui lòng quay lại vào ngày mai"*. | [ ] |
| **TC-VOTE-05** | **Giờ vàng nhân điểm (Promotion x2/x3)** | 1. Vào Admin kích hoạt sự kiện Giờ Vàng (VD: x2 điểm).<br>2. Ra ngoài thực hiện 1 lượt bình chọn miễn phí hoặc có phí. | - Badge Giờ vàng nhấp nháy trên trang chi tiết và modal.<br>- Thí sinh được cộng 2 điểm thay vì 1 điểm. | [ ] |
| **TC-VOTE-06** | **Chống bot / Captcha (Turnstile)** | 1. Quan sát widget Cloudflare Turnstile trong modal bình chọn.<br>2. Thử gửi request bình chọn trực tiếp không kèm token qua Postman/curl. | Backend từ chối request không hợp lệ (mã lỗi 400/403). | [ ] |
| **TC-VOTE-07** | **Bình chọn có phí qua SePay (nếu kích hoạt)** | 1. Chọn gói điểm (VD: Gói 10 điểm - 20.000đ).<br>2. Bấm *"Thanh toán"*.<br>3. Kiểm tra mã QR chuyển khoản hiển thị (đúng số tiền, nội dung chuyển khoản).<br>4. Thực hiện chuyển khoản test. | Cổng SePay webhook gửi tín hiệu về server -> Hệ thống tự động xác nhận và cộng điểm sau vài giây. | [ ] |

---

### PHẦN 5: HỆ THỐNG QUẢN TRỊ ADMIN (`/admin`)

| Mã TC | Hạng mục / Chức năng | Các bước thực hiện (Test Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ADM-01** | **Bảo mật truy cập Admin** | 1. Mở cửa sổ ẩn danh (chưa đăng nhập admin), truy cập thẳng `/admin` hoặc `/admin/candidates`. | Hệ thống tự động chặn và chuyển hướng về `/admin/login`. | [ ] |
| **TC-ADM-02** | **Đăng nhập Admin** | 1. Nhập tài khoản & mật khẩu admin.<br>2. Bấm *"Đăng nhập"*. | Đăng nhập thành công, vào Dashboard tổng quan. | [ ] |
| **TC-ADM-03** | **Quản lý Thí sinh (`/admin/candidates`) - Thêm mới** | 1. Bấm nút *"Thêm thí sinh mới"*.<br>2. Nhập Tên, SBD (duy nhất), Khoa, Lớp, Bảng thi (King/Queen), Vòng thi, Chiều cao, Cân nặng, Số đo, Tải ảnh.<br>3. Bấm *"Lưu"*. | Thí sinh mới lập tức hiển thị trên danh sách admin và hiển thị ngoài trang công khai. | [ ] |
| **TC-ADM-04** | **Quản lý Thí sinh - Chỉnh sửa & Xóa** | 1. Chọn một thí sinh, bấm *"Sửa"* -> Đổi số vote hoặc cập nhật ảnh/thông tin.<br>2. Bấm *"Lưu"*.<br>3. Thử tính năng Ẩn / Xóa thí sinh. | Dữ liệu cập nhật ngay lập tức ngoài frontend. Khi xóa/ẩn, thí sinh biến mất khỏi danh sách bình chọn. | [ ] |
| **TC-ADM-05** | **Quản lý Khán giả (`/admin/users`)** | 1. Truy cập `/admin/users`.<br>2. Kiểm tra danh sách người dùng đăng ký mới.<br>3. Bấm xem chi tiết (Detail): Kiểm tra các cột `Đối tượng`, `Khoa / Viện`, `MSSV`, `Bảng quan tâm`.<br>4. Bấm *"Sửa"* để cập nhật quyền (User / Admin) hoặc sửa thông tin. | Hiển thị đầy đủ, chính xác các trường khán giả mới tạo; chức năng sửa hoạt động tốt. | [ ] |
| **TC-ADM-06** | **Quản lý Đơn đăng ký (`/admin/registrations`)** | 1. Mở danh sách hồ sơ đăng ký gửi từ trang `/dang-ky`.<br>2. Bấm xem chi tiết hồ sơ thí sinh.<br>3. Bấm *"Phê duyệt"* (cấp SBD chính thức). | Hồ sơ được chuyển thành thí sinh chính thức trên hệ thống. | [ ] |
| **TC-ADM-07** | **Cài đặt Hệ thống (`/admin/settings`)** | 1. Bật / tắt công tắc: *"Mở cổng bình chọn"*, *"Mở đăng ký dự thi"*.<br>2. Đổi số lượt bình chọn miễn phí/ngày (VD: từ 2 đổi thành 3).<br>3. Bấm *"Lưu cấu hình"*. | Ra ngoài web kiểm tra: Trạng thái cổng mở/đóng và số lượt vote thay đổi đúng theo cấu hình admin. | [ ] |
| **TC-ADM-08** | **Quản lý Sự kiện Giờ vàng (`/admin/promotions`)** | 1. Tạo chương trình giờ vàng mới (Hệ số x2, thời gian bắt đầu & kết thúc).<br>2. Lưu và kích hoạt. | Banner thông báo giờ vàng kích hoạt trên toàn trang. | [ ] |

---

### PHẦN 6: KIỂM THỬ PHI CHỨC NĂNG (NON-FUNCTIONAL TESTING)

| Mã TC | Hạng mục | Phương pháp kiểm thử | Tiêu chí đạt (Acceptance Criteria) | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-PERF-01** | **Tốc độ tải trang (Page Load)** | Dùng Google Lighthouse / Network tab kiểm tra trang chủ, danh sách thí sinh, chi tiết thí sinh. | - Điểm Performance >= 85.<br>- Thời gian tải trang lần đầu < 2.5s.<br>- Ảnh được lazyload và dùng định dạng WebP tối ưu. | [ ] |
| **TC-RESP-01** | **Tương thích Mobile (iOS & Android)** | Mở web trên iPhone (Safari) và Samsung/Xiaomi (Chrome) hoặc DevTools Responsive Mode (375px, 390px, 412px, 768px). | - Menu hamburger mở trơn tru, không che nội dung.<br>- Bảng xếp hạng không tràn ngang (không sinh scroll ngang vỡ khung).<br>- Nút bấm dễ thao tác bằng ngón tay (tối thiểu 44x44px). | [ ] |
| **TC-RESP-02** | **Tương thích Trình duyệt (Cross-browser)** | Kiểm tra trên: Chrome, Safari, Microsoft Edge, Firefox, Cốc Cốc. | Giao diện, hiệu ứng animation và gradient đồng nhất trên mọi trình duyệt. | [ ] |
| **TC-SEC-01** | **Chống gian lận bình chọn (Anti-fraud)** | 1 tài khoản đăng nhập trên nhiều tab/trình duyệt khác nhau cùng bấm vote đồng thời để test race-condition. | Backend xử lý transaction an toàn, không bị double-spending điểm vote (chỉ nhận đúng 2 lượt). | [ ] |
| **TC-SEC-02** | **Kiểm tra lỗ hổng XSS / SQL Injection** | Thử nhập chuỗi `<script>alert('hack')</script>` hoặc `' OR '1'='1` vào ô tìm kiếm, form đăng ký, form bình luận. | Ký tự đặc biệt được sanitize / encode an toàn, không thực thi mã độc. | [ ] |
| **TC-SEO-01** | **Chia sẻ mạng xã hội (OpenGraph)** | Copy link `/thi-sinh/001` dán thử vào Facebook Debugger / Zalo Chat. | Hiển thị đầy đủ ảnh thumbnail đại diện thí sinh, tiêu đề có tên thí sinh và mô tả bắt mắt. | [ ] |

---

## III. HƯỚNG DẪN THỰC HIỆN & BÁO CÁO LỖI (BUG REPORT)

### 1. Phân loại mức độ lỗi
- **Critical (Nghiêm trọng)**: Lỗi làm chết trang, mất dữ liệu, gian lận được điểm bình chọn, sập server. *(Cần khắc phục ngay)*
- **Major (Lớn)**: Chức năng chính không hoạt động đúng (VD: không gửi được form đăng ký, không đăng nhập được).
- **Minor (Nhỏ)**: Lỗi giao diện nhỏ, sai chính tả, vỡ layout nhẹ trên một dòng máy đặc thù.
- **Trivial (Góp ý)**: Đề xuất cải thiện màu sắc, hiệu ứng hoặc câu từ cho hay hơn.

### 2. Mẫu báo cáo lỗi (Bug Template)
Khi phát hiện lỗi trong quá trình test, ghi nhận theo mẫu sau:
```markdown
- Mã Test Case liên quan: (VD: TC-VOTE-02)
- Mức độ: Critical / Major / Minor
- Thiết bị & Trình duyệt: (VD: iPhone 13 - Safari / Windows 11 - Chrome)
- Các bước tái hiện:
  1. Vào trang chi tiết thí sinh 001
  2. Bấm bình chọn
- Kết quả thực tế: (Ảnh chụp màn hình hoặc thông báo lỗi)
- Kết quả mong đợi: (Hệ thống phải hoạt động như thế nào)
```

---
*Kế hoạch này được biên soạn độc quyền cho hệ thống bình chọn cuộc thi **HUIT's ICONIC 2026**.*
