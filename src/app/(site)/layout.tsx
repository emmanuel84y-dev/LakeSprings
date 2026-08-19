import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import type { HotelSettings } from '@/types/database';

async function getHotelSettings(): Promise<HotelSettings | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('hotel_settings').select('*').eq('id', 1).maybeSingle();
    return data as HotelSettings | null;
  } catch {
    return null;
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getHotelSettings();

  return (
    <>
      <Navbar hotelName={settings?.name ?? 'LakeSprings Hotels'} />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton phone={settings?.whatsapp} />
    </>
  );
}
