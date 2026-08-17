'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Loader2 } from 'lucide-react';
import { archiveRoom } from '@/lib/actions/rooms-admin';

export function ArchiveRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Archive this room? It will be removed from the public site but its booking history is kept.')) return;
    startTransition(async () => {
      const result = await archiveRoom(roomId);
      if (result.ok) router.push('/admin/rooms');
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Archive Room
    </button>
  );
}
