'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { resolveImageUrl, cn } from '@/lib/utils';
import type { RoomImage } from '@/types/database';

export function RoomGallery({ images, roomName }: { images: RoomImage[]; roomName: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return <div className="aspect-[16/10] rounded-xl bg-mist" />;
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || lightboxIndex === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      const next = delta < 0 ? lightboxIndex + 1 : lightboxIndex - 1;
      setLightboxIndex(((next % sorted.length) + sorted.length) % sorted.length);
    }
    touchStartX.current = null;
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2 md:h-[480px]">
        <button
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-4 row-span-2 aspect-[16/10] overflow-hidden rounded-xl md:col-span-3 md:aspect-auto md:h-full"
        >
          <Image
            src={resolveImageUrl(sorted[0].storage_path, 'room-images')}
            alt={sorted[0].alt_text || roomName}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </button>
        <div className="col-span-4 hidden grid-rows-2 gap-2 md:grid md:col-span-1">
          {sorted.slice(1, 3).map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i + 1)}
              className="relative overflow-hidden rounded-xl"
            >
              <Image
                src={resolveImageUrl(img.storage_path, 'room-images')}
                alt={img.alt_text || roomName}
                fill
                sizes="20vw"
                className="object-cover"
              />
              {i === 1 && sorted.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-reservoir/60 text-sm font-medium text-white">
                  <Expand className="h-4 w-4" /> +{sorted.length - 3} more
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-reservoir-900/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${roomName} photo gallery`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + sorted.length) % sorted.length))}
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[70vh] w-full max-w-4xl">
            <Image
              src={resolveImageUrl(sorted[lightboxIndex].storage_path, 'room-images')}
              alt={sorted[lightboxIndex].alt_text || roomName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % sorted.length))}
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 flex gap-1.5">
            {sorted.map((_, i) => (
              <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i === lightboxIndex ? 'bg-brass' : 'bg-white/30')} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
