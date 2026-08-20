import { MessageCircle } from 'lucide-react';

export function WhatsAppButton({ phone }: { phone: string | null | undefined }) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, '');

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-dock transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
    </a>
  );
}
