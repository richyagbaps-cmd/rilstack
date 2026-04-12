import { supabase } from '@/lib/supabaseClient';

export async function logUserAction(actionType: string, details: any) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) throw userError || new Error('User not authenticated');
    const userId = userData.user.id;
    await supabase.from('user_actions').insert([
      {
        user_id: userId,
        action_type: actionType,
        action_details: details,
      }
    ]);
  } catch (err) {
    // Log error but do not block UI
    console.error('Failed to log user action:', err);
  }
}
