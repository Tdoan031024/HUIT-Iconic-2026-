'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DateTimeInputProps {
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
  disabled?: boolean;
}

function parseISO(iso: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const [datePart = '', timePart = ''] = iso.split('T');
  const [y = '', m = '', d = ''] = datePart.split('-');
  return {
    date: d && m && y ? `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}` : '',
    time: timePart.slice(0, 5),
  };
}

function toISO(date: string, time: string): string {
  const parts = date.split('/');
  const dd = parts[0] || '';
  const mm = parts[1] || '';
  const yyyy = parts[2] || '';
  if (!dd || !mm || !yyyy || yyyy.length < 4) return '';
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${time || '00:00'}`;
}

function isValidDate(date: string): boolean {
  const parts = date.split('/').map(Number);
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy || yyyy < 1970) return false;
  const dt = new Date(yyyy, mm - 1, dd);
  return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
}

function parseDateValue(date: string) {
  if (!isValidDate(date)) return null;
  const [dd, mm, yyyy] = date.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

function formatDateValue(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function DateTimeInput({ value = '', onChange, className = '', disabled }: DateTimeInputProps) {
  const [dateVal, setDateVal] = useState('');
  const [timeVal, setTimeVal] = useState('');
  const [dateError, setDateError] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLSpanElement>(null);
  const timePickerRef = useRef<HTMLSpanElement>(null);
  const skipEmit = useRef(true);

  const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  useEffect(() => {
    skipEmit.current = true;
    const { date, time } = parseISO(value);
    setDateVal(date);
    setTimeVal(time);
    const parsedDate = parseDateValue(date);
    if (parsedDate) setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setTimePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emit = (date: string, time: string) => {
    if (skipEmit.current) { skipEmit.current = false; return; }
    const iso = toISO(date, time);
    if (iso && onChange) onChange(iso);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d/]/g, '');
    if (raw.length === 2 && !dateVal.endsWith('/') && !raw.includes('/')) raw += '/';
    if (raw.length === 5 && (raw.match(/\//g) || []).length < 2) raw += '/';
    raw = raw.slice(0, 10);
    setDateVal(raw);
    const valid = raw.length === 10 && isValidDate(raw);
    setDateError(raw.length === 10 && !valid);
    if (valid) {
      const parsedDate = parseDateValue(raw);
      if (parsedDate) setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    }
    skipEmit.current = false;
    if (valid) emit(raw, timeVal);
  };

  const handleDateSelect = (date: Date) => {
    const nextDate = formatDateValue(date);
    setDateVal(nextDate);
    setDateError(false);
    setDatePickerOpen(false);
    skipEmit.current = false;
    emit(nextDate, timeVal);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d:]/g, '');
    if (raw.length === 2 && !timeVal.endsWith(':') && !raw.includes(':')) raw += ':';
    raw = raw.slice(0, 5);
    setTimeVal(raw);
    skipEmit.current = false;
    if (dateVal.length === 10 && isValidDate(dateVal) && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) emit(dateVal, raw);
  };

  const handleTimePartSelect = (part: 'hour' | 'minute', value: string) => {
    const [currentHour = '00', currentMinute = '00'] = timeVal.split(':');
    const nextTime = part === 'hour'
      ? `${value}:${(currentMinute || '00').padStart(2, '0')}`
      : `${(currentHour || '00').padStart(2, '0')}:${value}`;
    setTimeVal(nextTime);
    skipEmit.current = false;
    if (dateVal.length === 10 && isValidDate(dateVal)) emit(dateVal, nextTime);
  };

  const selectedHour = /^([01]\d|2[0-3]):[0-5]\d$/.test(timeVal) ? timeVal.slice(0, 2) : '00';
  const selectedMinute = /^([01]\d|2[0-3]):[0-5]\d$/.test(timeVal) ? timeVal.slice(3, 5) : '00';
  const selectedDate = parseDateValue(dateVal);
  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const firstDayOffset = (calendarStart.getDay() + 6) % 7;
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index - firstDayOffset + 1);
    return day;
  });
  const monthLabel = calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const base = [
    'h-9 px-2.5 rounded-lg border text-[13px] font-semibold focus:outline-none transition',
    disabled
      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
      : 'bg-[#fbfdfc] text-[#18211f] border-[#dce5e1] focus:border-[#0f766e]',
  ].join(' ');

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span ref={datePickerRef} className="relative z-[300] inline-flex">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={dateVal}
          onChange={handleDateChange}
          onFocus={() => !disabled && setDatePickerOpen(true)}
          disabled={disabled}
          maxLength={10}
          className={`${base} w-[136px] pr-10${dateError ? ' !border-red-400 !text-red-500' : ''}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDatePickerOpen((open) => !open)}
          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label="Chọn ngày"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </button>

        {datePickerOpen && !disabled && (
          <div className="absolute left-0 top-full z-[320] mt-1 w-[248px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Tháng trước"
              >
                ‹
              </button>
              <p className="text-sm font-black capitalize text-slate-800">{monthLabel}</p>
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Tháng sau"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <span key={day} className="flex h-7 items-center justify-center text-[10px] font-black uppercase text-slate-400">
                  {day}
                </span>
              ))}
              {calendarDays.map((day) => {
                const isOutside = day.getMonth() !== calendarMonth.getMonth();
                const isSelected = selectedDate &&
                  day.getFullYear() === selectedDate.getFullYear() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getDate() === selectedDate.getDate();
                const key = day.toISOString();
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`flex h-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                      isSelected ? 'bg-blue-600 text-white' : isOutside ? 'text-slate-300 hover:bg-slate-50' : 'text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </span>
      <span ref={timePickerRef} className="relative z-[300] inline-flex">
        <input
          type="text"
          inputMode="numeric"
          placeholder="HH:mm"
          value={timeVal}
          onChange={handleTimeChange}
          onFocus={() => !disabled && setTimePickerOpen(true)}
          disabled={disabled}
          maxLength={5}
          className={`${base} w-[84px] pr-8`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setTimePickerOpen((open) => !open)}
          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label="Chọn giờ"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>

        {timePickerOpen && !disabled && (
          <div className="absolute right-0 top-full z-[320] mt-1 w-[190px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Giờ</p>
                <div className="max-h-[168px] overflow-y-auto pr-1">
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimePartSelect('hour', hour)}
                      className={`mb-1 flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold transition ${
                        selectedHour === hour ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Phút</p>
                <div className="max-h-[168px] overflow-y-auto pr-1">
                  {minuteOptions.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimePartSelect('minute', minute)}
                      className={`mb-1 flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold transition ${
                        selectedMinute === minute ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </span>
    </span>
  );
}
