"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Sample data for dropdowns
const categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Beauty", "Books"];
const brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "LG", "Canon", "Dell"];

export interface EditBannerFormData {
  brand?: string;
  category?: string;
  linkUrl: string;
  imageFile?: File;
  customUrlAdded: boolean;
}

interface EditBannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: EditBannerFormData) => void;
  bannerData?: {
    id: string;
    image_url: string;
    link_url: string;
    brand?: string;
    category?: string;
    custom_url_added: boolean;
  } | null;
}

const EditBanner: React.FC<EditBannerProps> = ({
  open,
  onOpenChange,
  onSubmit,
  bannerData,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [mode, setMode] = useState<'brand' | 'category'>('brand');
  const [autoLink, setAutoLink] = useState<string>('');
  const [isCustomUrl, setIsCustomUrl] = useState<boolean>(true);
  const [customUrl, setCustomUrl] = useState<string>('');

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditBannerFormData>();

  // Update link automatically when mode or selection changes
  useEffect(() => {
    if (mode === 'brand') {
      setAutoLink(selectedBrand ? `/brand/${selectedBrand}` : '/brand/');
    } else {
      setAutoLink(selectedCategory ? `/products/${selectedCategory}` : '/products/');
    }
  }, [mode, selectedBrand, selectedCategory]);

  // Pre-fill form when bannerData changes
  useEffect(() => {
    if (bannerData) {
      setValue('linkUrl', bannerData.link_url);
      setImagePreview(bannerData.image_url);
      setCustomUrl(bannerData.link_url);
      
      // Always set switch to ON (true) regardless of database value
      setIsCustomUrl(true);
      
      // Determine mode and set selections based on existing data
      if (bannerData.brand) {
        setMode('brand');
        setSelectedBrand(bannerData.brand);
        setAutoLink(`/brand/${bannerData.brand}`);
      } else if (bannerData.category) {
        setMode('category');
        setSelectedCategory(bannerData.category);
        setAutoLink(`/products/${bannerData.category}`);
      } else {
        // If no brand/category, default to brand mode
        setMode('brand');
        setAutoLink('/brand/');
      }
    }
  }, [bannerData, setValue]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      // Reset form when sheet closes
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCategory('');
      setSelectedBrand('');
      setMode('brand');
      setAutoLink('/brand/');
      setCustomUrl('');
      // Don't reset isCustomUrl here - let it be set by bannerData
    }
  }, [open, reset]);

  // Function to detect brand/category from URL and set selections
  const detectFromUrl = (url: string) => {
    if (url.startsWith('/brand/')) {
      const brandValue = url.replace('/brand/', '');
      if (brandValue && brandValue !== '/') {
        setMode('brand');
        setSelectedBrand(brandValue);
        // Update auto-link after setting the brand
        setAutoLink(`/brand/${brandValue}`);
        return;
      }
    } else if (url.startsWith('/products/')) {
      const categoryValue = url.replace('/products/', '');
      if (categoryValue && categoryValue !== '/') {
        setMode('category');
        setSelectedCategory(categoryValue);
        // Update auto-link after setting the category
        setAutoLink(`/products/${categoryValue}`);
        return;
      }
    }
  };

  // Handle custom URL switch change
  const handleCustomUrlChange = (checked: boolean) => {
    setIsCustomUrl(checked);
    
    if (!checked) {
      // Switching from custom to auto-generated mode
      // Try to detect brand/category from the current custom URL
      detectFromUrl(customUrl);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmitForm = async (data: EditBannerFormData) => {
    try {
      // Only check brand/category if custom URL switch is OFF
      if (!isCustomUrl) {
        if (mode === 'brand' && !selectedBrand) {
          toast.error('Please select a brand');
          return;
        }
        if (mode === 'category' && !selectedCategory) {
          toast.error('Please select a category');
          return;
        }
      }
      
      const finalLinkUrl = isCustomUrl ? customUrl : autoLink;
      if (!finalLinkUrl.trim()) {
        toast.error('Please enter a link URL');
        return;
      }
      
      const formData = {
        ...data,
        brand: mode === 'brand' ? selectedBrand : undefined,
        category: mode === 'category' ? selectedCategory : undefined,
        imageFile: selectedImage || undefined,
        linkUrl: finalLinkUrl,
        customUrlAdded: isCustomUrl,
      };
      
      if (onSubmit) {
        onSubmit(formData);
      }
      onOpenChange(false);
      toast.success('Banner updated successfully!');
    } catch (error) {
      toast.error('Failed to update banner');
      console.error('Error updating banner:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>Edit Hero Banner</SheetTitle>
          <SheetDescription>
            Update your banner with image, brand or category, and link URL.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 mt-8">
          {/* Toggle Brand/Category */}
          <div className="flex items-center gap-4 mb-2">
            <Label className="mr-2">Select Mode:</Label>
            <Button
              type="button"
              variant={mode === 'brand' ? 'default' : 'outline'}
              onClick={() => setMode('brand')}
              className={mode === 'brand' ? '' : 'opacity-70'}
            >
              Brand
            </Button>
            <Button
              type="button"
              variant={mode === 'category' ? 'default' : 'outline'}
              onClick={() => setMode('category')}
              className={mode === 'category' ? '' : 'opacity-70'}
            >
              Category
            </Button>
          </div>

          {/* Brand and Category Dropdowns in a Row */}
          <div className="flex gap-4">
            {/* Brand Dropdown */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={selectedBrand}
                onValueChange={setSelectedBrand}
                disabled={mode !== 'brand' || isCustomUrl}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Dropdown */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={mode !== 'category' || isCustomUrl}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom URL Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="custom-url"
              checked={isCustomUrl}
              onCheckedChange={handleCustomUrlChange}
            />
            <Label htmlFor="custom-url">Use custom URL</Label>
          </div>

          {/* Link URL Input */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL</Label>
            {isCustomUrl ? (
              <Input
                id="linkUrl"
                type="text"
                placeholder="Enter custom URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            ) : (
              <Input
                id="linkUrl"
                type="text"
                value={autoLink}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            )}
            {errors.linkUrl && (
              <p className="text-sm text-red-500">{errors.linkUrl.message}</p>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Banner Image</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={600}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>

              </div>
            )}
          </div>

          {/* Form Actions */}
          <SheetFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || 
                !imagePreview || 
                (isCustomUrl && !customUrl.trim()) ||
                (!isCustomUrl && (mode === 'brand' ? !selectedBrand : !selectedCategory))
              }
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Banner'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditBanner; 