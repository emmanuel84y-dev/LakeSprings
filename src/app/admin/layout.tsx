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
