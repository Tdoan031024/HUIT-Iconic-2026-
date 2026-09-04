'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { apiUrl } from '../api';
import { useAlert } from '../AlertProvider';

type RegistrationForm = {
  fullName: string; gender: string; dateOfBirth: string; faculty: string; major: string; className: string;
  studentId: string; placeOfBirth: string; identityNumber: string; identityIssuedDate: string;
  identityIssuedPlace: string; address: string; phone: string; email: string; facebookUrl: string;
  videoUrl: string; talent: string; achievements: string; selfIntroduction: string; inspirationalMessage: string;
  facultyIntroduction: string; ambassadorPlan: string; heightCm: string; weightKg: string; measurementBust: string;
  measurementWaist: string; measurementHip: string; portraitImageUrl: string; fullBodyImageUrl: string;
  consentAccepted: boolean;
};

const HUIT_FACULTIES = [
  'Khoa Công nghệ Thông tin',
  'Khoa Công nghệ Thực phẩm',
  'Khoa Quản trị Kinh doanh',
  'Khoa Tài chính - Kế toán',
  'Khoa Ngoại ngữ',
  'Khoa Du lịch & Ẩm thực',
  'Khoa May & Thời trang',
  'Khoa Công nghệ Hóa học',
  'Khoa Công nghệ Sinh học & Kỹ thuật Môi trường',
  'Khoa Điện - Điện tử',
  'Khoa Cơ khí',
  'Khoa Luật',
  'Khoa Khoa học Ứng dụng',
  'Khoa Chính trị - Luật',
  'Khoa Giáo dục Thể chất & Quốc phòng',
  'Viện Đào tạo Quốc tế',
  'Khoa / Viện khác',
];

const initialForm: RegistrationForm = {
  fullName: '', gender: '', dateOfBirth: '', faculty: '', major: '', className: '', studentId: '', placeOfBirth: '',
  identityNumber: '', identityIssuedDate: '', identityIssuedPlace: '', address: '', phone: '', email: '',
  facebookUrl: '', videoUrl: '', talent: '', achievements: '', selfIntroduction: '', inspirationalMessage: '', facultyIntroduction: '',
  ambassadorPlan: '', heightCm: '', weightKg: '', measurementBust: '', measurementWaist: '', measurementHip: '',
  portraitImageUrl: '', fullBodyImageUrl: '', consentAccepted: false,
};

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#0A2FFF] focus:ring-4 focus:ring-blue-100';
const textareaClass = 'mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0A2FFF] focus:ring-4 focus:ring-blue-100';

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0A2FFF] text-sm font-black text-white">{number}</span>
      <div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>
    </div>
    {children}
  </section>;
}

function Label({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return <span className="text-sm font-bold text-slate-700">{children}{required && <b className="ml-1 text-red-500">*</b>}</span>;
}

export default function RegistrationPage() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(initialForm);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof RegistrationForm, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  async function upload(file: File) {
    const data = new FormData();
    data.append('file', file);
    const response = await fetch(apiUrl('/api/admin/upload'), { method: 'POST', body: data });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.url) throw new Error(result?.error || 'Không thể tải ảnh lên.');
    return result.url as string;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portraitFile || !fullBodyFile) {
      showAlert('Vui lòng tải đủ ảnh chân dung và ảnh toàn thân.', 'warning', 'Thiếu ảnh hồ sơ');
      return;
    }
    setLoading(true);
    try {
      const [portraitImageUrl, fullBodyImageUrl] = await Promise.all([upload(portraitFile), upload(fullBodyFile)]);
      const response = await fetch(apiUrl('/api/registrations'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, portraitImageUrl, fullBodyImageUrl }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || 'Không thể gửi hồ sơ.');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showAlert(result.message, 'success', 'Gửi hồ sơ thành công');
    } catch (error: any) {
      showAlert(error.message || 'Không thể gửi hồ sơ lúc này.', 'error', 'Lỗi đăng ký');
    } finally { setLoading(false); }
  }

  if (submitted) return <main className="min-h-[70vh] bg-slate-50 px-4 py-16 sm:px-6"><div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div><h1 className="mt-6 text-3xl font-black text-slate-950">Đã tiếp nhận hồ sơ</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">Cảm ơn bạn đã đăng ký dự thi HUIT&apos;s ICONIC. Ban tổ chức sẽ kiểm tra hồ sơ và liên hệ qua email hoặc điện thoại.</p><a className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#0A2FFF] px-6 font-bold text-white" href="/">Về trang chủ</a></div></main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#0A2FFF]">HUIT&apos;s ICONIC 2026</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Đăng ký dự thi</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Hãy hoàn thành hồ sơ để Ban tổ chức tìm hiểu câu chuyện, cá tính và thế mạnh của bạn.</p>
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-blue-950">
            <span>📌</span> Tiêu chuẩn thí sinh tham gia HUIT&apos;s ICONIC 2026 (Mục 04 Đề án):
          </p>
          <ul className="mt-1.5 list-disc list-inside space-y-1 text-blue-800">
            <li>Là sinh viên đang theo học hệ chính quy tại Trường Đại học Công Thương TP.HCM (HUIT).</li>
            <li>Tiêu chuẩn chiều cao chính thức: <b>Nữ từ 1m60 trở lên</b>, <b>Nam từ 1m70 trở lên</b>.</li>
            <li>Ngoại hình cân đối, gương mặt khả ái, có phẩm chất đạo đức tốt và lối sống lành mạnh.</li>
          </ul>
        </div>
        <p className="mt-3 text-sm text-slate-500"><b className="text-red-500">*</b> Trường bắt buộc. Hồ sơ được tiếp nhận để kiểm tra trước khi công bố chính thức.</p>
      </header>
      <form onSubmit={submit} className="space-y-6">
        <Section number="01" title="Thông tin cá nhân" description="Thông tin dùng để xác minh tư cách tham gia cuộc thi.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><Label required>Họ và tên thí sinh</Label><input required className={inputClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></label>
            <label><Label required>Giới tính</Label><select required className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}><option value="">Chọn giới tính</option><option value="FEMALE">Nữ</option><option value="MALE">Nam</option></select></label>
            <label><Label required>Ngày sinh</Label><input required type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></label>
            <label><Label required>Khoa/ Viện/ Phòng quản lý sinh viên:</Label><input required type="text" placeholder="Nhập Khoa, Viện hoặc Phòng quản lý sinh viên..." className={inputClass} value={form.faculty} onChange={(e) => update('faculty', e.target.value)} /></label>
            <label><Label required>Ngành học</Label><input required placeholder="Ví dụ: Công nghệ thông tin" className={inputClass} value={form.major} onChange={(e) => update('major', e.target.value)} /></label>
            <label><Label required>Lớp</Label><input required placeholder="Ví dụ: 12DHTH01" className={inputClass} value={form.className} onChange={(e) => update('className', e.target.value)} /></label>
            <label><Label required>MSSV</Label><input required placeholder="Ví dụ: 200120xxxx" className={inputClass} value={form.studentId} onChange={(e) => update('studentId', e.target.value)} /></label>
            <label><Label required>Nơi sinh</Label><input required className={inputClass} value={form.placeOfBirth} onChange={(e) => update('placeOfBirth', e.target.value)} /></label>
            <label><Label required>Số CMND/CCCD</Label><input required inputMode="numeric" className={inputClass} value={form.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} /></label>
            <label><Label required>Ngày cấp</Label><input required type="date" className={inputClass} value={form.identityIssuedDate} onChange={(e) => update('identityIssuedDate', e.target.value)} /></label>
            <label><Label required>Nơi cấp</Label><input required className={inputClass} value={form.identityIssuedPlace} onChange={(e) => update('identityIssuedPlace', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label required>Địa chỉ liên lạc</Label><input required className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} /></label>
            <label><Label required>Điện thoại di động</Label><input required type="tel" inputMode="tel" placeholder="09xxxxxxxx" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
            <label><Label required>Địa chỉ email</Label><input required type="email" placeholder="example@gmail.com" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label required>Link Facebook cá nhân</Label><input required type="url" placeholder="https://facebook.com/..." className={inputClass} value={form.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} /></label>
            <label className="sm:col-span-2"><Label>Năng khiếu nổi bật</Label><textarea className={textareaClass} placeholder="Ví dụ: ca hát, nhảy, MC, nhiếp ảnh..." value={form.talent} onChange={(e) => update('talent', e.target.value)} /></label>
          </div>
        </Section>

        <Section number="02" title="Mong muốn/ câu chuyện của bạn khi đến với cuộc thi" description="Hãy chia sẻ ngắn gọn, chân thật về mong muốn hoặc câu chuyện của bạn khi đến với HUIT's ICONIC 2026.">
          <div className="space-y-5">
            <label>
              <Label required>Mong muốn/ câu chuyện của bạn khi đến với cuộc thi</Label>
              <textarea
                required
                rows={5}
                placeholder="Chia sẻ lý do, mong muốn hoặc câu chuyện truyền cảm hứng của bạn khi tham gia cuộc thi..."
                className={textareaClass}
                value={form.selfIntroduction}
                onChange={(e) => update('selfIntroduction', e.target.value)}
              />
            </label>
          </div>
        </Section>

        <Section number="03" title="Ảnh hồ sơ" description="Ảnh chính diện, rõ mặt, trang phục lịch sự. Mỗi ảnh tối đa 15MB, định dạng JPG, PNG hoặc WEBP.">
          <div className="grid gap-5 sm:grid-cols-2"><label className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5"><Label required>Ảnh chân dung</Label><input required type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-bold file:text-blue-700" onChange={(e) => setPortraitFile(e.target.files?.[0] || null)} />{portraitFile && <p className="mt-3 truncate text-xs text-emerald-600">Đã chọn: {portraitFile.name}</p>}</label><label className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5"><Label required>Ảnh toàn thân nghệ thuật</Label><input required type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-bold file:text-blue-700" onChange={(e) => setFullBodyFile(e.target.files?.[0] || null)} />{fullBodyFile && <p className="mt-3 truncate text-xs text-emerald-600">Đã chọn: {fullBodyFile.name}</p>}</label></div>
        </Section>

        <Section number="04" title="Chỉ số hình thể" description="Nhập theo đơn vị centimet và kilogram.">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <div className="flex items-center justify-between">
                <Label required>Chiều cao (cm)</Label>
                <span className="text-[11px] font-semibold text-blue-600">Nữ ≥ 160, Nam ≥ 170</span>
              </div>
              <input required type="number" min="100" max="250" step="0.1" placeholder="Ví dụ: 168" className={inputClass} value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
            </label>
            <label><Label required>Cân nặng (kg)</Label><input required type="number" min="20" max="200" step="0.1" placeholder="Ví dụ: 52" className={inputClass} value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} /></label>
          </div>
        </Section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-8"><h2 className="text-xl font-black text-slate-950">05. Cam kết của thí sinh</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700"><li>Chịu trách nhiệm về tính chính xác và trung thực của nội dung đăng ký.</li><li>Thực hiện đúng quy định pháp luật Việt Nam và quy định của Ban tổ chức.</li><li>Hiểu rằng lịch thi là dự kiến và quyết định của Ban tổ chức là quyết định cuối cùng.</li><li>Đồng ý để Ban tổ chức sử dụng hình ảnh phục vụ truyền thông trong và ngoài cuộc thi.</li></ul><label className="mt-6 flex items-start gap-3 text-sm font-bold text-slate-800"><input required type="checkbox" className="mt-1 h-5 w-5 accent-[#0A2FFF]" checked={form.consentAccepted} onChange={(e) => update('consentAccepted', e.target.checked)} />Tôi đã đọc, hiểu và đồng ý với các cam kết trên cũng như thể lệ cuộc thi.</label></section>

        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:p-7"><div><p className="font-black">Sau khi gửi hồ sơ</p><p className="mt-1 text-sm leading-6 text-slate-300">Tham gia nhóm Zalo hướng dẫn: <a className="font-bold text-cyan-300 underline" href="https://zalo.me/g/myzijputivfgc1toua9z" target="_blank" rel="noreferrer">zalo.me/g/myzijputivfgc1toua9z</a></p></div><button disabled={loading} className="h-12 w-full rounded-xl bg-[#79BCC2] px-7 font-black text-slate-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:w-auto">{loading ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký'}</button></div>
      </form>
    </div>
  </main>;
}
