'use client';

import React, { useState, useRef, useCallback } from 'react';
import { apiUrl } from '../api';

interface ImageDropzoneProps {
  label?: string;
  subLabel?: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatioHint?: string;
  placeholderText?: string;
  className?: string;
  accept?: string;
  required?: boolean;
  isVideoAllowed?: boolean;
}

// Compress image on client side if > 1.5MB to save bandwidth and speed up upload
async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function ImageDropzone({
  label = 'Hình ảnh / Logo',
  subLabel = 'Hỗ trợ kéo thả file trực tiếp từ máy tính (JPG, PNG, WEBP, SVG, MP4)',
  value,
  onChange,
  aspectRatioHint = 'Khuyên dùng: Tỷ lệ ngang 16:9 hoặc hình vuông rõ nét',
  placeholderText = 'Kéo và thả tệp ảnh vào đây, hoặc nhấp để tải lên từ máy tính',
  className = '',
  accept = 'image/*,video/mp4,video/webm',
  required = false,
  isVideoAllowed = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatAssetUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/') || url.startsWith('/original_assets/')) return apiUrl(url);
    return url;
  };

  const isVideoUrl = (url?: string | null) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
  };

  const uploadFile = async (rawFile: File) => {
    const isImage = rawFile.type.startsWith('image/');
    const isVideo = rawFile.type.startsWith('video/') || rawFile.name.endsWith('.mp4');

    if (!isImage && (!isVideoAllowed || !isVideo)) {
      setUploadError('Tệp được chọn không phải là định dạng hình ảnh hoặc video được hỗ trợ.');
      return;
    }

    // Limit: 15MB for image, 50MB for video
    const maxLimit = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (rawFile.size > maxLimit) {
      setUploadError(`Dung lượng tệp quá lớn (Tối đa ${isVideo ? '50MB' : '15MB'}).`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const fileToUpload = isImage ? await compressImageIfNeeded(rawFile).catch(() => rawFile) : rawFile;
      setUploadProgress(40);

      const formData = new FormData();
      formData.append('file', fileToUpload);

      setUploadProgress(65);
      const res = await fetch(apiUrl('/api/admin/upload'), {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setUploadProgress(100);
      } else {
        const errData = await res.json().catch(() => ({}));
        setUploadError(errData.error || errData.message || 'Tải tệp lên máy chủ thất bại.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải tệp:', err);
      setUploadError('Không thể kết nối đến máy chủ tải tệp.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadError(null);
  };

  const displayUrl = formatAssetUrl(value);
  const isCurrentVideo = isVideoUrl(value);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Label section */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {aspectRatioHint && (
          <span className="text-[10px] text-slate-400 font-medium">{aspectRatioHint}</span>
        )}
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
          isDragging
            ? 'border-[#0A2FFF] bg-blue-50/70 scale-[1.01] shadow-lg ring-4 ring-blue-500/20'
            : value
              ? 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-[#0A2FFF]/60 hover:bg-blue-50/30 shadow-inner'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/20 border-t-white" />
            <p className="mt-2.5 text-xs font-bold tracking-wide">Đang xử lý & tải lên ({uploadProgress}%)...</p>
            <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-gradient-to-r from-[#0A2FFF] to-[#79BCC2] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dragging Overlay Guide */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A2FFF]/10 backdrop-blur-[2px] border-2 border-dashed border-[#0A2FFF] rounded-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl text-[#0A2FFF] animate-bounce">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mt-2 text-xs font-black text-[#0A2FFF] uppercase tracking-wider">Thả file vào đây để tải lên ngay</p>
          </div>
        )}

        {/* CONTENT STATE 1: HAS PREVIEW */}
        {value ? (
          <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative h-24 w-36 shrink-0 rounded-xl border border-slate-200 bg-white p-2 shadow-sm flex items-center justify-center overflow-hidden group/preview">
              {isCurrentVideo ? (
                <video
                  src={displayUrl}
                  className="max-h-full max-w-full object-contain"
                  controls={false}
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  src={displayUrl}
                  alt="Xem trước ảnh"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/logo_iconic.png';
                  }}
                />
              )}
            </div>

            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đã tải {isCurrentVideo ? 'video' : 'ảnh'} lên
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-700 truncate">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Kéo file từ máy tính thả vào đây hoặc bấm đổi file
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm hover:border-[#0A2FFF] hover:text-[#0A2FFF] transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Đổi file khác
                </button>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* CONTENT STATE 2: EMPTY DROPZONE */
          <div className="py-7 px-4 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-400 group-hover:text-[#0A2FFF] group-hover:border-blue-300 group-hover:scale-110 transition duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <p className="mt-2.5 text-xs font-bold text-slate-700">
              <span className="text-[#0A2FFF] hover:underline">Nhấp để chọn tệp từ máy tính</span> hoặc kéo thả file vào đây
            </p>
            <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
              {subLabel}
            </p>
          </div>
        )}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
          <span>⚠️</span> {uploadError}
        </p>
      )}

      {/* Manual URL Input fallback */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Hoặc nhập URL:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... hoặc /uploads/..."
          className="h-7 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600 focus:bg-white focus:border-[#0A2FFF] focus:outline-none transition font-mono"
        />
      </div>
    </div>
  );
}
