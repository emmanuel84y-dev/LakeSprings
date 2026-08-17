import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, active')
    .eq('id', user.id)
    .maybeSingle();

  // Belt-and-suspenders: middleware already checked this, but a
  // Server Component should never trust an upstream check it can
  // verify itself — RLS would block the actual data queries below
  // regardless, this just gives a clean redirect instead of an
  // empty/broken dashboard.
  if (!profile?.active) redirect('/login?error=not_authorized');

  return (
    <div className="flex bg-mist">
      <AdminSidebar staffName={profile.full_name} staffRole={profile.role} />
      <div className="min-h-screen flex-1 overflow-x-hidden">
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
