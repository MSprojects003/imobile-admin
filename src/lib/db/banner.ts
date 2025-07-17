import { supabase } from '@/lib/supabase/client';

export interface HeroBanner {
  id: string;
  image_url: string;
  link_url: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  custom_url_added: boolean;
}

export interface CreateHeroBannerData {
  imageFile: File;
  linkUrl: string;
  brand?: string;
  category?: string;
  customUrlAdded: boolean;
}

export interface UpdateHeroBannerData {
  id: string;
  imageFile?: File;
  linkUrl: string;
  brand?: string;
  category?: string;
  customUrlAdded: boolean;
}

// Insert new hero banner
export const insertHeroBanner = async (data: CreateHeroBannerData): Promise<HeroBanner | null> => {
  try {
    // Upload image to Supabase storage
    const fileName = `banner-${Date.now()}-${data.imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('banner')
      .upload(fileName, data.imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error('Failed to upload image');
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('banner')
      .getPublicUrl(fileName);

    // Insert banner data into database
    const { data: bannerData, error: insertError } = await supabase
      .from('hero')
      .insert({
        image_url: urlData.publicUrl,
        link_url: data.linkUrl,
        custom_url_added: data.customUrlAdded,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting banner:', insertError);
      // Delete uploaded image if database insert fails
      await supabase.storage.from('banner').remove([fileName]);
      throw new Error('Failed to insert banner');
    }

    return bannerData;
  } catch (error) {
    console.error('Error in insertHeroBanner:', error);
    throw error;
  }
};

// Update existing hero banner
export const updateHeroBanner = async (data: UpdateHeroBannerData): Promise<HeroBanner | null> => {
  try {
    let imageUrl: string | undefined = undefined; // Don't update image_url if no new image

    // If new image is provided, upload it
    if (data.imageFile) {
      // First, get the current banner to find the old image URL
      const { data: currentBanner, error: fetchError } = await supabase
        .from('hero')
        .select('image_url')
        .eq('id', data.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current banner:', fetchError);
        throw new Error('Failed to fetch current banner');
      }

      // Delete the old image from storage if it exists
      if (currentBanner?.image_url) {
        try {
          // Extract filename from Supabase storage URL
          // URL format: https://xxx.supabase.co/storage/v1/object/public/banner/filename.jpg
          const urlParts = currentBanner.image_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          
          console.log('Deleting old image:', oldFileName); // Debug log
          
          if (oldFileName && oldFileName !== '') {
            const { error: deleteError } = await supabase.storage
              .from('banner')
              .remove([oldFileName]);

            if (deleteError) {
              console.error('Error deleting old image from storage:', deleteError);
              // Continue with upload even if old image deletion fails
            } else {
              console.log('Successfully deleted old image:', oldFileName); // Debug log
            }
          }
        } catch (deleteError) {
          console.error('Error processing old image deletion:', deleteError);
          // Continue with upload even if old image deletion fails
        }
      }

      // Upload the new image
      const fileName = `banner-${Date.now()}-${data.imageFile.name}`;
      console.log('Uploading new image:', fileName); // Debug log
      
      const { error: uploadError } = await supabase.storage
        .from('banner')
        .upload(fileName, data.imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('banner')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
      console.log('New image URL:', imageUrl); // Debug log
    }

    // Prepare update data
    const updateData: { link_url: string; custom_url_added: boolean; updated_at: string; image_url?: string } = {
      link_url: data.linkUrl,
      custom_url_added: data.customUrlAdded,
      updated_at: new Date().toISOString(),
    };

    // Only update image_url if a new image was uploaded
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    // Update banner data in database
    const { data: bannerData, error: updateError } = await supabase
      .from('hero')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating banner:', updateError);
      throw new Error('Failed to update banner');
    }

    return bannerData;
  } catch (error) {
    console.error('Error in updateHeroBanner:', error);
    throw error;
  }
};

// Soft delete hero banner
export const deleteHeroBanner = async (id: string, imageUrl: string): Promise<boolean> => {
  try {
    // First, update the database to mark as deleted
    const { error: updateError } = await supabase
      .from('hero')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error soft deleting banner:', updateError);
      throw new Error('Failed to delete banner');
    }

    // Then, delete the image from storage
    try {
      // Extract filename from the image URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('banner')
          .remove([fileName]);

        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          // Don't throw error here as the database update was successful
          // The image will remain in storage but banner is marked as deleted
        }
      }
    } catch (storageError) {
      console.error('Error processing image deletion:', storageError);
      // Continue even if image deletion fails
    }

    return true;
  } catch (error) {
    console.error('Error in deleteHeroBanner:', error);
    throw error;
  }
};

// Get all active hero banners
export const getAllHeroBanners = async (): Promise<HeroBanner[]> => {
  try {
    const { data, error } = await supabase
      .from('hero')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching banners:', error);
      throw new Error('Failed to fetch banners');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllHeroBanners:', error);
    throw error;
  }
};
