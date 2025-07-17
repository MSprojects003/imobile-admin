import { supabase } from "../supabase/client";

export async function Login(){
    const { data, error } = await supabase
    .from('admin')
    .select('*');
    
  if (error) throw error;
  return data;
}