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
    // 1. Get all order_items for this order
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order_id)
      .eq('is_deleted', false);

    if (orderItemsError) {
      console.error('Order items fetch error:', orderItemsError);
      throw new Error('Order items fetch error: ' + orderItemsError.message);
    }
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items found for this order');
    }

    // 2. For each order item, update the product quantity and collect updated info
    const updatedProducts = [];
    for (const item of orderItems) {
      const { product_id, quantity: orderQuantity } = item;

      // Get current product quantity
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', product_id)
        .single();

      if (productError) {
        console.error('Product fetch error:', productError);
        throw new Error('Product fetch error: ' + productError.message);
      }
      if (!productData || typeof productData.quantity !== 'number') {
        throw new Error('Product not found');
      }
      const currentProductQuantity = productData.quantity;
      const newQuantity = currentProductQuantity - orderQuantity;

      // Update product quantity
      const { error: updateProductError } = await supabase
        .from('products')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', product_id);

      if (updateProductError) {
        console.error('Product update error:', updateProductError);
        throw new Error('Product update error: ' + updateProductError.message);
      }

      updatedProducts.push({ product_id, quantity: newQuantity });
    }

    // 3. Update the order status
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ 
        status: true, 
        track_id: track_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Order update error:', error);
      throw new Error('Order update error: ' + error.message);
    }

    // Return updated order and updated product quantities
    return { order: updatedOrder, updatedProducts };
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

