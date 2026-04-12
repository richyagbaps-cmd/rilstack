import { supabase } from '@/lib/supabaseClient';

export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.is_admin === true;
}
