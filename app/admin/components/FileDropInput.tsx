'use client';

import { useRef, useState } from 'react';

type FileDropInputProps = {
  accept?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void | Promise<void>;
};

export default function FileDropInput({ accept = 'image/*', label = 'Kéo thả file vào đây', helperText, disabled = false, maxSizeMB = 15, onFileSelect }: FileDropInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const selectFile = async (file?: File) => {
    if (!file || disabled) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File vượt quá giới hạn ${maxSizeMB} MB.`);
      return;
    }
    setError('');
    try { await onFileSelect(file); } catch (err: any) { setError(err?.message || 'Không thể tải file lên.'); }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void selectFile(e.dataTransfer.files[0]); }} className={`w-full rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${dragging ? 'border-[#0A2FFF] bg-blue-50' : 'border-slate-300 bg-slate-50/70 hover:border-[#0A2FFF]/60 hover:bg-blue-50/30'}`}>
        <span className="block text-sm font-bold text-slate-700">{dragging ? 'Thả file để tải lên' : label}</span>
        <span className="mt-1 block text-xs text-slate-400">{helperText || `Hoặc bấm để chọn, tối đa ${maxSizeMB} MB`}</span>
        <input ref={inputRef} type="file" accept={accept} className="hidden" disabled={disabled} onChange={(e) => void selectFile(e.target.files?.[0])} />
      </button>
      {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
