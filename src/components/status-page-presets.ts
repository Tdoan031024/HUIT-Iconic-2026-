import { StatusPageProps } from './StatusPage';

type PresetInput = Omit<StatusPageProps, 'actions'>;

const presets: Record<StatusPageProps['code'], PresetInput> = {
  401: {
    code: 401,
    title: 'Bạn cần đăng nhập để tiếp tục',
    description: 'Trang này chỉ dành cho người dùng đã xác thực. Hãy đăng nhập đúng tài khoản rồi thử lại.',
    hint: 'Nếu bạn vừa hết phiên đăng nhập, hệ thống sẽ yêu cầu xác thực lại để đảm bảo an toàn.',
  },
  403: {
    code: 403,
    title: 'Bạn không có quyền truy cập',
    description: 'Yêu cầu đã được nhận nhưng tài khoản hiện tại không được phép mở nội dung này.',
    hint: 'Nếu bạn nghĩ đây là nhầm lẫn, hãy đăng nhập bằng tài khoản phù hợp hoặc liên hệ quản trị viên.',
  },
  404: {
    code: 404,
    title: 'Trang bạn tìm không tồn tại',
    description: 'Liên kết có thể đã thay đổi, bị gỡ bỏ hoặc địa chỉ đang nhập chưa chính xác.',
    hint: 'Bạn có thể quay lại trang chủ hoặc thử mở lại từ menu điều hướng chính.',
  },
  429: {
    code: 429,
    title: 'Bạn thao tác quá nhanh',
    description: 'Hệ thống đang tạm giới hạn số lần gửi yêu cầu để bảo vệ máy chủ và dữ liệu.',
    hint: 'Hãy đợi một lúc rồi thử lại. Nếu tình trạng lặp lại liên tục, kiểm tra lại thao tác tự động hoặc tốc độ gửi biểu mẫu.',
  },
  500: {
    code: 500,
    title: 'Hệ thống vừa gặp lỗi',
    description: 'Máy chủ không thể xử lý yêu cầu này ở thời điểm hiện tại. Dữ liệu của bạn chưa chắc đã được ghi nhận.',
    hint: 'Hãy thử tải lại trang. Nếu lỗi còn tiếp diễn, vui lòng liên hệ bộ phận kỹ thuật để kiểm tra log hệ thống.',
  },
  503: {
    code: 503,
    title: 'Hệ thống đang tạm thời gián đoạn',
    description: 'Website đang bảo trì hoặc một dịch vụ quan trọng chưa sẵn sàng nên chưa thể phục vụ yêu cầu của bạn.',
    hint: 'Bạn có thể quay lại sau ít phút. Khi hoàn tất bảo trì, website sẽ hoạt động bình thường mà không cần cấu hình thêm.',
  },
};

export function getStatusPreset(code: StatusPageProps['code']) {
  return presets[code];
}
