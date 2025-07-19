import { supabase } from "../supabase/client";

export async function getAllorders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`*,
        users(*),
        order_items(*,
          products(*)
        )`
      )
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  export async function getOrdersVariantbyId(order_id:string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*,
        order_items(*,
        products(*))`)
      .eq('is_deleted', false)
      .eq('id',order_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  export async function acceptOrder(order_id: string, track_id: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: true, 
        track_id: track_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('is_deleted', false)
      .select();
    
    if (error) throw error;
    return data;
  }

  export async function cancelOrder(order_id: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: false, 
        track_id: '', // set to empty string instead of null
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('is_deleted', false)
      .select();

    if (error) throw error;
    return data;
  }

