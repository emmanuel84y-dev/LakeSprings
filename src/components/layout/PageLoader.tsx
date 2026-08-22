'use client';

import { useEffect, useState } from 'react';

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const finish = () => {
      setLeaving(true);
      window.setTimeout(() => setVisible(false), 650);
    };

    if (document.readyState === 'complete') {
      const timer = window.setTimeout(finish, 250);
      return () => window.clearTimeout(timer);
    }

    window.addEventListener('load', finish, { once: true });
    const fallback = window.setTimeout(finish, 3500);

    return () => {
      window.removeEventListener('load', finish);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F2E2B] transition-opacity duration-700 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      aria-label="Loading LakeSprings Hotels"
      role="status"
    >
      <div className="flex w-[min(80vw,360px)] flex-col items-center">
        <div className="overflow-hidden text-center">
          <div className="animate-[loaderReveal_1.2s_ease-out_forwards] translate-y-3 opacity-0 font-display text-3xl font-medium tracking-wide text-[#D4AF37] sm:text-4xl">
            LakeSprings Hotels
          </div>
        </div>
        <div className="mt-6 h-px w-full overflow-hidden bg-white/10">
          <div className="h-full w-1/3 animate-[loaderProgress_1.5s_ease-in-out_infinite] bg-[#D4AF37]" />
        </div>
      </div>
    </div>
  );
}
