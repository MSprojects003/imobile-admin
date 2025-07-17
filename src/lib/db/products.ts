import { supabase } from "../supabase/client";

// Define a type for product input
export interface ProductInput {
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  brand: string;
  models: string[];
  colors: string[];
  image: string | File;
  backImage?: string | File;
  discount?: number;
}

// Helper to upload a file to the 'products' bucket and return the public URL
async function uploadImageToBucket(file: File, folder: string = ""): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { error } = await supabase.storage.from('products').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

// Insert product into the products table
export async function insertProduct(product: ProductInput) {
  let imageUrl = product.image;
  let backImageUrl = product.backImage;

  // Upload images if they are File objects
  if (product.image instanceof File) {
    imageUrl = await uploadImageToBucket(product.image, 'front-');
  }
  if (product.backImage instanceof File) {
    backImageUrl = await uploadImageToBucket(product.backImage, 'back-');
  }

  // Prepare the row for insertion
  const row = {
    name: product.name,
    price: product.price,
    description: product.description,
    quantity: product.quantity,
    category: product.category,
    brand: product.brand,
    models: product.models,
    colors: product.colors,
    image: imageUrl,
    back_image: backImageUrl || null,
    discount: product.discount ?? 0,
    is_deleted: false,
    // created_at, updated_at are handled by default
  };

  const { data, error } = await supabase
    .from('products')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return data;
  
}

 export async function getproductsMedia() {
    try {
      const { data, error } = await supabase
        .storage
        .from('products')
        .list('', {
          limit: 100,
          offset: 0,
        })

      if (error) {
        throw new Error(error.message);
      }

     return data;
    } catch (err) {
      console.error("Error fetching products media:", err);
      return null;
    }
  }

// Fetch a product by its UUID
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Update product in the products table
export async function updateProduct(productId: string, product: ProductInput) {
  let imageUrl = product.image;
  let backImageUrl = product.backImage;

  // Upload new images if they are File objects
  if (product.image instanceof File) {
    imageUrl = await uploadImageToBucket(product.image, 'front-');
  }
  if (product.backImage instanceof File) {
    backImageUrl = await uploadImageToBucket(product.backImage, 'back-');
  }

  // Prepare the update data
  const updateData: Partial<Omit<ProductInput, 'image' | 'backImage'>> & {
    image?: string;
    back_image?: string;
    discount?: number;
    updated_at: string;
  } = {
    name: product.name,
    price: product.price,
    description: product.description,
    quantity: product.quantity,
    category: product.category,
    brand: product.brand,
    models: product.models,
    colors: product.colors,
    discount: product.discount ?? 0,
    updated_at: new Date().toISOString(),
  };

  // Only update image URLs if new images were uploaded
  if (product.image instanceof File) {
    updateData.image = imageUrl as string;
  }
  if (product.backImage instanceof File) {
    updateData.back_image = backImageUrl as string;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add or update discount for a product
export async function addDiscount(productId: string, discount: number) {
  const { data, error } = await supabase
    .from('products')
    .update({
      discount,
      discount_added: discount > 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Soft delete a product by setting is_deleted to true
export async function softDeleteProduct(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get all customers from users table
export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_deleted', false)
    .order('created_date', { ascending: false });
  if (error) throw error;
  return data;
}