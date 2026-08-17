import { createClient } from '@/lib/supabase/server';
export async function getAdminResource(table:string, order='created_at', ascending=false, limit=200) {
  const supabase=createClient();
  const {data}=await supabase.from(table).select('*').order(order,{ascending}).limit(limit);
  return data ?? [];
}
export async function getAdminResourceById(table:string,id:string) {
  const supabase=createClient(); const {data}=await supabase.from(table).select('*').eq('id',id).maybeSingle(); return data;
}
