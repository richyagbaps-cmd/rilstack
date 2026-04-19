import { supabase } from "@/lib/supabaseClient";

export async function saveUserData(formData: { name: string; email: string }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user)
    throw userError || new Error("User not authenticated");
  const userId = userData.user.id;
  const { data, error } = await supabase
    .from("users")
    .upsert([
      {
        id: userId,
        name: formData.name,
        email: formData.email,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}
