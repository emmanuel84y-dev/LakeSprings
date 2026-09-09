'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';

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

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall back to the native date input focus below.
      }
    }

    input.focus();
  }

  const label = id === 'checkin' ? 'Check-in date' : id === 'checkout' ? 'Check-out date' : 'Date';

  return (
    <div className="relative h-12 w-full overflow-hidden rounded-md border border-sand bg-white transition-colors focus-within:border-brass focus-within:ring-1 focus-within:ring-brass">
      <div className="pointer-events-none absolute inset-y-0 left-0 right-12 flex items-center px-4">
        <span className={displayValue ? 'text-sm text-ink' : 'text-sm text-ink/45'}>
          {displayValue || 'Select date (dd/mm/yyyy)'}
        </span>
      </div>

      <Calendar className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink/55" aria-hidden="true" />

      <input
        ref={dateInputRef}
        id={id}
        type="date"
        value={value}
        min={min}
        required={required}
        aria-label={`${label}, format dd/mm/yyyy`}
        onChange={(e) => handleDateChange(e.target.value)}
        onClick={openPicker}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
