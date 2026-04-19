import { supabase } from "@/lib/supabaseClient";

export async function fetchInvestments() {
  const { data, error } = await supabase.from("investments").select("*");
  if (error) throw error;
  return data;
}

export async function updateInvestmentUnits(id: string, units: number) {
  const { data, error } = await supabase
    .from("investments")
    .update({ total_units_available: units })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
