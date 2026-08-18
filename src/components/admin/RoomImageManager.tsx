'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Star,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { resolveImageUrl, cn } from '@/lib/utils';
import {
  uploadRoomImage,
  deleteRoomImage,
  setPrimaryRoomImage,
  reorderRoomImage,
} from '@/lib/actions/rooms-admin';
import type { RoomImage } from '@/types/database';

export function RoomImageManager({
  roomId,
  images,
}: {
  roomId: string;
  images: RoomImage[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const sorted = [...images].sort(
    (a, b) => a.display_order - b.display_order,
  );

  function handleUpload(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await uploadRoomImage(roomId, formData);

      if (!result.ok) {
        setError(result.error ?? 'Upload failed');
      } else if (fileInput.current) {
        fileInput.current.value = '';
      }
    });
  }

  return (
    <div>
      <form action={handleUpload} className="flex items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-sm text-ink/70 file:mr-3 file:rounded-md file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:text-ink hover:file:bg-sand/60"
        />

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-reservoir px-4 py-2 text-sm font-medium text-white hover:bg-reservoir-900 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </button>
      </form>

      <p className="mt-1.5 text-xs text-ink/40">
        JPEG, PNG, or WebP — up to 5MB.
      </p>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {sorted.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {sorted.map((img, i) => (
            <ImageTile
              key={img.id}
              roomId={roomId}
              image={img}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink/50">
          No images yet — the first upload becomes the primary image
          automatically.
        </p>
      )}
    </div>
  );
}

function ImageTile({
  roomId,
  image,
  isFirst,
  isLast,
}: {
  roomId: string;
  image: RoomImage;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const handleReorder = (direction: 'up' | 'down') => {
    startTransition(async () => {
      await reorderRoomImage(roomId, image.id, direction);
    });
  };

  const handleSetPrimary = () => {
    startTransition(async () => {
      await setPrimaryRoomImage(roomId, image.id);
    });
  };

  const handleDelete = () => {
    if (!confirm('Remove this image?')) {
      return;
    }

    startTransition(async () => {
      await deleteRoomImage(roomId, image.id, image.storage_path);
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-sand">
      <div className="relative aspect-[4/3]">
        <Image
          src={resolveImageUrl(image.storage_path, 'room-images')}
          alt={image.alt_text}
          fill
          className="object-cover"
        />

        {image.is_primary && (
          <span className="absolute left-2 top-2 rounded-full bg-brass px-2 py-0.5 text-[10px] font-medium text-white">
            Primary
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5">
        <div className="flex gap-0.5">
          <IconButton
            title="Move earlier"
            disabled={isFirst || pending}
            onClick={() => handleReorder('up')}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </IconButton>

          <IconButton
            title="Move later"
            disabled={isLast || pending}
            onClick={() => handleReorder('down')}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <div className="flex gap-0.5">
          <IconButton
            title="Set as primary"
            disabled={image.is_primary || pending}
            onClick={handleSetPrimary}
          >
            <Star
              className={cn(
                'h-3.5 w-3.5',
                image.is_primary && 'fill-brass text-brass',
              )}
            />
          </IconButton>

          <IconButton
            title="Delete"
            disabled={pending}
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="grid h-6 w-6 place-items-center rounded text-ink/50 hover:bg-mist disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  );
}
