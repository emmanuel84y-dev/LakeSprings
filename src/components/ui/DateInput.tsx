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
        className="w-full cursor-pointer bg-transparent text-sm text-ink focus:outline-none"
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
    </div>
  );
}
