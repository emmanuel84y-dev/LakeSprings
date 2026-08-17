'use client';

import { useState } from 'react';

export function FlutterwaveButton({ reference, email }: { reference: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingReference: reference, email }),
      });
      const json = await response.json();
      if (!response.ok || !json.payment_url) {
        setError(json.error || 'Unable to start payment');
        setLoading(false);
        return;
      }
      window.location.href = json.payment_url;
    } catch {
      setError('Unable to start payment. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button onClick={pay} disabled={loading} className="w-full rounded-md bg-reservoir px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
        {loading ? 'Opening secure payment…' : 'Pay now with Flutterwave'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
