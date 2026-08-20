'use client';

import { useEffect, useState } from 'react';

function formatDisplay(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

function parseDisplay(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
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

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  function handleChange(next: string) {
    setDisplayValue(next);
    const iso = parseDisplay(next);
    if (iso && (!min || iso >= min)) onChange(iso);
  }

  function handleBlur() {
    const iso = parseDisplay(displayValue);
    if (!iso || (min && iso < min)) {
      setDisplayValue(formatDisplay(value));
      return;
    }
    onChange(iso);
    setDisplayValue(formatDisplay(iso));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      required={required}
      value={displayValue}
      onChange={(e) => handleChange(e.target.value.replace(/[^0-9/]/g, '').slice(0, 10))}
      onBlur={handleBlur}
      placeholder="dd/mm/yyyy"
      pattern="\\d{2}/\\d{2}/\\d{4}"
      className="w-full bg-transparent text-sm text-ink focus:outline-none"
      aria-label={id === 'checkin' ? 'Check-in date, dd/mm/yyyy' : id === 'checkout' ? 'Check-out date, dd/mm/yyyy' : 'Date, dd/mm/yyyy'}
    />
  );
}
