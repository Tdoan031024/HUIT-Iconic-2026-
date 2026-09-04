// scripts/run-test-suite.mjs

const BASE_URL = 'http://localhost:3000';

const results = [];

function record(tcId, name, passed, details = '') {
  results.push({ tcId, name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${tcId}] ${name}: ${details}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG HỆ THỐNG HUIT ICONIC 2026');
  console.log(`🌐 Mục tiêu: ${BASE_URL}`);
  console.log('================================================================\n');

  // --- PHẦN 1: PUBLIC PAGES ---
  console.log('--- PHẦN 1: KIỂM TRA CÁC TRANG PUBLIC & NỘI DUNG ---');
  
  const publicPages = [
    { url: '/', tc: 'TC-PUB-01', name: 'Trang chủ (/)', checkText: 'HUIT' },
    { url: '/gioi-thieu', tc: 'TC-PUB-01b', name: 'Trang Giới thiệu (/gioi-thieu)', checkText: 'HUIT' },
    { url: '/the-le', tc: 'TC-PUB-05', name: 'Trang Thể lệ (/the-le)', checkText: '/dang-ky' },
    { url: '/thoi-gian', tc: 'TC-PUB-06', name: 'Trang Thời gian (/thoi-gian)', checkText: '/dang-ky' },
    { url: '/thi-sinh/001', tc: 'TC-PUB-08', name: 'Trang Chi tiết thí sinh (/thi-sinh/001)', checkText: '001' },
    { url: '/bang-xep-hang', tc: 'TC-PUB-09', name: 'Trang Bảng xếp hạng (/bang-xep-hang)', checkText: 'Bảng' },
    { url: '/dang-ky', tc: 'TC-PUB-02', name: 'Trang Đăng ký dự thi (/dang-ky)', checkText: 'Đăng ký' },
    { url: '/dang-nhap', tc: 'TC-AUTH-01', name: 'Trang Đăng nhập (/dang-nhap)', checkText: 'Đăng nhập' },
  ];

  for (const page of publicPages) {
    try {
      const res = await fetch(`${BASE_URL}${page.url}`);
      const text = await res.text();
      const statusOk = res.status === 200;
      const containsCheck = text.includes(page.checkText);
      const passed = statusOk && containsCheck;
      record(page.tc, page.name, passed, `Status: ${res.status}, Chứa "${page.checkText}": ${containsCheck}`);
    } catch (err) {
      record(page.tc, page.name, false, `Lỗi kết nối: ${err.message}`);
    }
  }

  // Check /thi-sinh redirect
  try {
    const res = await fetch(`${BASE_URL}/thi-sinh`, { redirect: 'manual' });
    const isRedirect = res.status === 307 || res.status === 308 || res.status === 200;
    record('TC-PUB-07', 'Trang Thí sinh (/thi-sinh chuyển hướng về Bảng xếp hạng)', isRedirect, `Status: ${res.status}`);
  } catch (err) {
    record('TC-PUB-07', 'Trang Thí sinh', false, err.message);
  }

  // --- PHẦN 2: KIỂM TRA ĐĂNG KÝ THÍ SINH DỰ THI (/api/registrations) ---
  console.log('\n--- PHẦN 2: KIỂM TRA FORM ĐĂNG KÝ THÍ SINH ---');
  try {
    const testRegData = {
      fullName: 'Thí Sinh Test Tự Động',
      birthDate: '2004-05-15',
      gender: 'Nữ',
      contestTable: 'QUEEN',
      faculty: 'Khoa Công nghệ Thông tin',
      major: 'Công nghệ Thông tin',
      className: '12DHTH01',
      studentId: `2001${Date.now().toString().slice(-6)}`,
      placeOfBirth: 'TP. Hồ Chí Minh',
      identityNumber: '079204001234',
      identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
      address: '140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM',
      phone: '0987654321',
      email: `candidate_test_${Date.now()}@gmail.com`,
      heightCm: 168,
      weightKg: 49,
      bustCm: 84,
      waistCm: 60,
      hipCm: 90,
      talent: 'Múa đương đại & Dẫn chương trình tiếng Anh',
      motto: 'Tỏa sáng nét đẹp bản lĩnh sinh viên HUIT',
      portraitImageUrl: '/duan/anhmauduan.png',
      fullBodyImageUrl: '/duan/anhmauduan.png',
      videoUrl: 'https://youtube.com/watch?v=sample',
      consentAccepted: true
    };

    const regRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRegData)
    });

    const regJson = await regRes.json();
    const regPassed = regRes.status === 200 || regRes.status === 201;
    record('TC-REG-04', 'Gửi hồ sơ đăng ký dự thi trực tuyến (đầy đủ chỉ số 3 vòng & cam kết)', regPassed, `Status: ${regRes.status}, ID: ${regJson.id || regJson.registrationCode || 'OK'}`);
  } catch (err) {
    record('TC-REG-04', 'Gửi hồ sơ đăng ký dự thi', false, err.message);
  }

  // --- PHẦN 3: XÁC THỰC & ĐĂNG KÝ KHÁN GIẢ ---
  console.log('\n--- PHẦN 3: KIỂM TRA TÀI KHOẢN KHÁN GIẢ ---');
  const testAudienceEmail = `audience_test_${Date.now()}@huit.edu.vn`;
  const testPassword = 'Password123!';
  let createdUserId = null;

  try {
    // Đăng ký khán giả mới
    const regUserRes = await fetch(`${BASE_URL}/api/web/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Khán Giả Test HUIT',
        email: testAudienceEmail,
        password: testPassword,
        audienceType: 'Sinh viên HUIT',
        faculty: 'Khoa Công nghệ Thông tin',
        studentId: '2001210888',
        contestTable: 'ALL'
      })
    });

    const regUserData = await regUserRes.json();
    const regUserOk = regUserRes.status === 200 && regUserData.user;
    createdUserId = regUserData.user?.id;
    record('TC-AUTH-03', 'Đăng ký tài khoản Khán giả mới (kèm Khoa, MSSV, Bảng thi)', regUserOk, `Status: ${regUserRes.status}, UserID: ${createdUserId}`);

    // Đăng nhập khán giả
    const loginRes = await fetch(`${BASE_URL}/api/web/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAudienceEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    const loginOk = loginRes.status === 200 && loginData.user;
    record('TC-AUTH-04', 'Đăng nhập Khán giả với mật khẩu đúng', loginOk, `Status: ${loginRes.status}, Welcome: ${loginData.user?.fullName || loginData.user?.name}`);

    // Đăng nhập sai mật khẩu
    const failLoginRes = await fetch(`${BASE_URL}/api/web/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAudienceEmail,
        password: 'WrongPassword!'
      })
    });
    const failLoginOk = failLoginRes.status === 400 || failLoginRes.status === 401;
    record('TC-AUTH-05', 'Chặn đăng nhập khi sai mật khẩu', failLoginOk, `Status: ${failLoginRes.status} (Expected rejection)`);

  } catch (err) {
    record('TC-AUTH-03', 'Tài khoản khán giả', false, err.message);
  }

  // --- PHẦN 4: HẠN MỨC BÌNH CHỌN & LOGIC VOTE MIỄN PHÍ ---
  console.log('\n--- PHẦN 4: KIỂM TRA LOGIC BÌNH CHỌN & HẠN MỨC (QUOTA) ---');
  if (createdUserId) {
    try {
      // 1. Kiểm tra hạn mức ban đầu
      const quotaRes1 = await fetch(`${BASE_URL}/api/voting/free-quota/${createdUserId}`);
      const quota1 = await quotaRes1.json();
      const quota1Ok = quota1.remaining === 2;
      record('TC-VOTE-02a', 'Kiểm tra hạn mức vote miễn phí ban đầu (2 lượt/ngày)', quota1Ok, `Hạn mức nhận được: ${quota1.remaining}/2`);

      // 2. Bình chọn lần 1
      const vote1Res = await fetch(`${BASE_URL}/api/candidates/001/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createdUserId,
          isFree: true
        })
      });
      const vote1Data = await vote1Res.json();
      const vote1Ok = vote1Res.status === 200;
      record('TC-VOTE-02b', 'Thực hiện bình chọn miễn phí Lần 1', vote1Ok, `Status: ${vote1Res.status}, Msg: ${vote1Data.message || 'Thành công'}`);

      // Kiểm tra quota sau lần 1
      const quotaRes2 = await fetch(`${BASE_URL}/api/voting/free-quota/${createdUserId}`);
      const quota2 = await quotaRes2.json();
      const quota2Ok = quota2.remaining === 1;
      record('TC-VOTE-02c', 'Hạn mức giảm còn 1/2 sau lần vote thứ nhất', quota2Ok, `Còn lại: ${quota2.remaining}`);

      // 3. Bình chọn lần 2
      const vote2Res = await fetch(`${BASE_URL}/api/candidates/001/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createdUserId,
          isFree: true
        })
      });
      const vote2Ok = vote2Res.status === 200;
      record('TC-VOTE-03', 'Thực hiện bình chọn miễn phí Lần 2', vote2Ok, `Status: ${vote2Res.status}`);

      // Kiểm tra quota sau lần 2
      const quotaRes3 = await fetch(`${BASE_URL}/api/voting/free-quota/${createdUserId}`);
      const quota3 = await quotaRes3.json();
      const quota3Ok = quota3.remaining === 0;
      record('TC-VOTE-03b', 'Hạn mức giảm về 0/2 sau khi dùng đủ 2 lượt', quota3Ok, `Còn lại: ${quota3.remaining}`);

      // 4. Cố tình vote lần 3 khi quota = 0 (phải bị chặn)
      const vote3Res = await fetch(`${BASE_URL}/api/candidates/001/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createdUserId,
          isFree: true
        })
      });
      const vote3Blocked = vote3Res.status === 400 || vote3Res.status === 403;
      record('TC-VOTE-04', 'Chặn bình chọn khi đã hết hạn mức miễn phí trong ngày', vote3Blocked, `Status: ${vote3Res.status} (Chặn thành công)`);

    } catch (err) {
      record('TC-VOTE-02', 'Bình chọn miễn phí', false, err.message);
    }
  }

  // --- PHẦN 5: BẢO MẬT & TRANG QUẢN TRỊ ADMIN ---
  console.log('\n--- PHẦN 5: KIỂM TRA BẢO MẬT ADMIN ---');
  try {
    // Truy cập API admin khi chưa đăng nhập quyền admin
    const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/registrations`);
    const adminBlocked = unauthAdminRes.status === 401 || unauthAdminRes.status === 403;
    record('TC-ADM-01', 'Chặn truy cập trái phép API Quản trị Admin', adminBlocked, `Status: ${unauthAdminRes.status} (Bảo mật tốt)`);
  } catch (err) {
    record('TC-ADM-01', 'Bảo mật Admin', false, err.message);
  }

  // --- TỔNG KẾT ---
  console.log('\n================================================================');
  console.log('📊 KẾT QUẢ TỔNG HỢP KIỂM THỬ:');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`Tổng số Test Cases: ${total}`);
  console.log(`✅ Thành công: ${passedCount}`);
  console.log(`❌ Thất bại: ${failedCount}`);
  console.log(`Tỉ lệ đạt: ${((passedCount / total) * 100).toFixed(1)}%`);
  console.log('================================================================');
}

runTests();
