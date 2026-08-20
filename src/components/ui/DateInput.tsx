'use client';

import { useEffect, useRef, useState } from 'react';

function formatDisplay(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

export function DateInput({
  value,
  onChange,
  min,
  required = false,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
  id?: string;
}) {
  const [displayValue, setDisplayValue] = useState(formatDisplay(value));
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  function handleDateChange(next: string) {
    if (!next || (min && next < min)) return;
    onChange(next);
    setDisplayValue(formatDisplay(next));
  }

  function openPicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.focus();
  }

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        value={displayValue}
        readOnly
        required={required}
        placeholder="dd/mm/yyyy"
        aria-label={id === 'checkin' ? 'Check-in date, dd/mm/yyyy' : id === 'checkout' ? 'Check-out date, dd/mm/yyyy' : 'Date, dd/mm/yyyy'}
        onClick={openPicker}
        className="w-full cursor-pointer bg-transparent pr-10 text-sm text-ink focus:outline-none"
      />
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => handleDateChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-full w-full opacity-0"
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Open date picker"
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink/60"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9h18" />
        </svg>
      </button>
    </div>
  );
}
