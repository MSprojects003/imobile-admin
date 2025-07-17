"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { useProductById } from '@/hooks/use-product-by-id';
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '@/lib/db/products';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";
import Image from "next/image";


const categories = [
  "Back Covers",
  "Tempered Glass",
  "Car Charger",
  "Earphones",
  "Smart Watches",
  "Cable & Charger",
  "Car Holder",
  "Pendrive & SD Card",
  "Watch Accessories",
  "Selfie Stick",
  "Ring Light",
  "Tripods",
  "Back Stickers",
  "Speaker",
  "Airpods & Earbuds",
  "Power Bank",
  "Phone Pouch",
  "Tab Pouch",
  "Airpods Accessories",
  "Computer Accessories",
  "Gadgets",
];
const brands = [
  "akg",
  "denmen",
  "anker",
  "jbl",
  "jccom",
  "belkin",
  "baseus",
  "joyroom",
  "kingston",
  "mtb",
  "remax",
  "spigen",
  "kaiyue",
];
const availableModels = [
  "A01", "M01Core", "M02", "M02s", "A03", "A03s", "A03Core", "A04", "A04E", "A05", "A05s", "A06", "A10s", "A11", "A12", "M13", "A13(4g)", "A21s", "A14", "A72", "A55", "A16", "N.8", "N.8pro", "R.9", "N.9", "N.9pro", "R.9A", "R.9C", "R.10", "R.10C", "A1+", "R.12", "R.13", "R.A3", "R.12C", "R.14C", "N.13Pro+", "N.14 4g", "N.14pro +", "R.A5", "Smart 8", "Smart 9", "A18", "A38", "A3s", "A3Pro", "A5Pro", "X5+", "X5B+", "X6A", "X7C", "X7B", "C20", "C51", "Y93", "Y85", "Y1s", "Y04", "Y70", "Y12s", "Y17s", "Y29s", "30c", "Pop 7", "20c"
];
const availableColors = [
  "Mint", "Apricot", "Royal blue", "Yellow", "Lilac", "Light Pink", "Lavender", "Midnight Blue", "White", "Antique White", "Stone",
  "Pink", "Orange", "Red", "Dark Grey", "Blue", "Turquoise", "Black", "Pink Sand", "Navy Blue", "Ice Blue", "Coffee",
  "Pebble", "Azure", "Camellia", "Mist Blue", "Flamingo", "Lavender Grey", "Gold", "Peach", "Chinese Red", "Green", "Brown",
  "Purple", "Olive", "Cobalt", "Rose Red", "Shiny Pink", "Shiny Purple", "Green", "Flash", "Maroon Grape", "Shiny Blue",
  "Army Green", "Cosmos", "Spearmint", "Dragon Fruit", "Papaya", "Canary Yellow", "Mellow", "Watermelon Pink", "Cornflower", "Atrovirens", "Pine green",
  "Black Currant", "Plum", "Sky blue", "Pomegranate", "Cactus", "Grapefruit", "Sierra Blue", "Forest Blue", "Neon Yellow", "Blue Horizon", "New peach",
  "New blue", "Deep navy", "deep purple", "clay", "pistachio", "lilac purple", "grey pink", "Titanium Gery", "Dark Brown", "Desert gold"
];
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  brand: string;
  models: string[];
  colors: string[];
  image: string;
  backImage?: string | null;
  discount?: number;
}

type EditProductProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
};

const sectionTitle = (title: string) => (
  <div className="text-xl font-bold text-gray-600 mb-3 tracking-tight">{title}</div>
);

const sectionBox = (children: React.ReactNode) => (
  <div className="border border-gray-200 rounded-xl bg-gray-50 p-5 mb-6 shadow-sm">{children}</div>
);

const EditProduct: React.FC<EditProductProps> = ({ open, productId, onClose }) => {
  const { data: product, isLoading, error } = useProductById(productId);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<Product>({
    defaultValues: {
      id: '',
      name: '',
      price: 0,
      description: '',
      quantity: 0,
      category: '',
      brand: '',
      models: [],
      colors: [],
      image: '',
      backImage: '',
      discount: undefined,
    },
  });

  // State for handling file uploads
  const [selectedFrontImage, setSelectedFrontImage] = useState<File | null>(null);
  const [selectedBackImage, setSelectedBackImage] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);
  const [customModels, setCustomModels] = useState<string[]>([""]);

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: Product }) => 
      updateProduct(productId, { ...productData, backImage: productData.backImage ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    },
  });

  // Map back_image to backImage for compatibility
  const displayProduct = product ? { ...product, backImage: product.backImage || product.back_image } : null;

  // Use a ref to track the last productId that was reset
  const lastProductId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (open && displayProduct && productId && lastProductId.current !== productId) {
      console.log('Product data:', displayProduct);
      console.log('Setting category:', displayProduct.category);
      console.log('Setting brand:', displayProduct.brand);
      
      // Reset form with product data including proper field mapping
      reset({
        id: displayProduct.id,
        name: displayProduct.name,
        price: displayProduct.price,
        description: displayProduct.description,
        quantity: displayProduct.quantity,
        category: displayProduct.category || '',
        brand: displayProduct.brand || '',
        models: displayProduct.models || [],
        colors: displayProduct.colors || [],
        image: displayProduct.image,
        backImage: displayProduct.backImage,
        discount: displayProduct.discount,
      });
      
      // Set image previews
      setFrontImagePreview(displayProduct.image);
      setBackImagePreview(displayProduct.backImage || displayProduct.back_image || null);
      
      // Reset selected images
      setSelectedFrontImage(null);
      setSelectedBackImage(null);
      
      // Force set the values after a small delay to ensure form is reset
      setTimeout(() => {
        setValue('category', displayProduct.category || '');
        setValue('brand', displayProduct.brand || '');
      }, 100);
      
      // If the product has models not in availableModels, switch to custom mode and prefill
      const missingModels = (displayProduct.models || []).filter((m: string) => !availableModels.includes(m));
      if (missingModels.length > 0) {
        if (!customModelMode) setCustomModelMode(true);
        if (JSON.stringify(customModels) !== JSON.stringify(missingModels)) setCustomModels(missingModels);
      } else {
        if (customModelMode) setCustomModelMode(false);
        if (customModels.length !== 1 || customModels[0] !== "") setCustomModels([""]);
      }
      
      lastProductId.current = productId;
    }
    if (!open) {
      lastProductId.current = null;
      if (customModelMode) setCustomModelMode(false);
      if (customModels.length !== 1 || customModels[0] !== "") setCustomModels([""]);
    }
    // eslint-disable-next-line
  }, [open, displayProduct, productId, reset, setValue]);

  const handleFrontImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedFrontImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFrontImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleBackImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedBackImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const removeFrontImage = () => {
    setSelectedFrontImage(null);
    setFrontImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('front-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const removeBackImage = () => {
    setSelectedBackImage(null);
    setBackImagePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('back-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = (data: Product) => {
    if (!productId) {
      toast.error('No product ID found');
      return;
    }

    const discount = data.discount === undefined || data.discount === null ? undefined : data.discount;
    const productData: Product = { 
      ...displayProduct, 
      ...data, 
      discount,
      image: selectedFrontImage || data.image,
      backImage: selectedBackImage || data.backImage,
      models: customModelMode ? customModels.filter(Boolean) : data.models,
    };
    
    updateMutation.mutate({ productId, productData });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-3xl font-medium text-gray-900">Edit Product</SheetTitle>
            <SheetDescription className="text-gray-600 text-base">
              Update the details for this product.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="space-y-6">
              {/* Skeleton for Product Basic Details */}
              {sectionBox(<>
                {sectionTitle('Product Basic Details')}
                <div className="grid grid-cols-1 gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </>)}
              {/* Skeleton for Product Category */}
              {sectionBox(<>
                {sectionTitle('Product Category')}
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </>)}
              {/* Skeleton for Product Metadata */}
              {sectionBox(<>
                {sectionTitle('Product Metadata')}
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </>)}
              {/* Skeleton for Product Images */}
              {sectionBox(<>
                {sectionTitle('Product Images')}
                <div className="flex gap-4 items-center mb-4">
                  <Skeleton className="h-24 w-24" />
                  <Skeleton className="h-24 w-24" />
                </div>
              </>)}
              {/* Skeleton for Discount and Quantity */}
              {sectionBox(<>
                <div className="grid grid-cols-1 gap-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              </>)}
              <div className="flex justify-end space-x-3 pt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">Failed to load product details.</div>
          ) : !displayProduct ? (
            <div className="text-center py-8">No product found.</div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Basic Details */}
            {sectionBox(<>
              {sectionTitle('Product Basic Details')}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-gray-800">Product Name</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Product name is required" })}
                    placeholder="Enter product name"
                    className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {typeof errors.name?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="price" className="text-base font-semibold text-gray-800">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Price must be positive" },
                      valueAsNumber: true,
                    })}
                    placeholder="Enter price"
                    className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {typeof errors.price?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description" className="text-base font-semibold text-gray-800">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description", { required: "Description is required" })}
                    placeholder="Enter product description"
                    className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {typeof errors.description?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-base font-semibold text-gray-800">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 0, message: "Quantity must be positive" },
                      valueAsNumber: true,
                    })}
                    placeholder="Enter quantity"
                    className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {typeof errors.quantity?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
                </div>
              </div>
            </>)}

            {/* Product Category */}
            {sectionBox(<>
              {sectionTitle('Product Category')}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="brand" className="text-base font-semibold text-gray-800">Brand</Label>
                  <Controller
                    name="brand"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Brand is required" }}
                    render={({ field }) => {
                      console.log('Brand field value:', field.value);
                      return (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-md shadow-lg">
                            {brands.map((brand) => (
                              <SelectItem key={brand} value={brand} className="hover:bg-gray-100">
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {typeof errors.brand?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
                </div>
                <div>
                  <Label htmlFor="category" className="text-base font-semibold text-gray-800">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Category is required" }}
                    render={({ field }) => {
                      console.log('Category field value:', field.value);
                      return (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white rounded-md shadow-lg">
                            {categories.map((category) => (
                              <SelectItem key={category} value={category} className="hover:bg-gray-100">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {typeof errors.category?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
              </div>
            </>)}

            {/* Product Metadata */}
            {sectionBox(<>
              {sectionTitle('Product Metadata')}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-gray-800">Models</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Custom</span>
                      <Switch checked={customModelMode} onCheckedChange={setCustomModelMode} />
                    </div>
                  </div>
                  {customModelMode ? (
                    <div className="flex flex-col gap-2 mt-2">
                      {customModels.map((model, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {customModels.length > 1 && idx > 0 && (
                            <button
                              type="button"
                              onClick={() => setCustomModels(customModels.filter((_, i) => i !== idx))}
                              className="p-1 rounded-full hover:bg-red-100 text-red-500 border border-red-200"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <Input
                            value={model}
                            onChange={e => {
                              const arr = [...customModels];
                              arr[idx] = e.target.value;
                              setCustomModels(arr);
                            }}
                            placeholder="Enter custom model name"
                            className="flex-1"
                            disabled={!customModelMode}
                          />
                          {idx === customModels.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setCustomModels([...customModels, ""])}
                              className="p-1 rounded-full hover:bg-blue-100 text-blue-500 border border-blue-200"
                              title="Add"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-lg bg-gray-100 mt-2">
                      {availableModels.map((model) => (
                        <div key={model} className="flex items-center space-x-2">
                          <Controller
                            name="models"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value.includes(model)}
                                onCheckedChange={(checked) => {
                                  const updatedModels = checked
                                    ? [...field.value, model]
                                    : field.value.filter((m: string) => m !== model);
                                  field.onChange(updatedModels);
                                }}
                                className="h-5 w-5 text-blue-600"
                                disabled={customModelMode}
                              />
                            )}
                          />
                          <Label className="text-sm text-gray-600">{model}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {typeof errors.models?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.models.message}</p>}
                </div>
                <div>
                  <Label className="text-base font-semibold text-gray-800">Colors</Label>
                  <Controller
                    name="colors"
                    control={control}
                    render={({ field }) => (
                      <>
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-lg bg-gray-100">
                          {availableColors.map((color, idx) => {
                            const colorBg = color.toLowerCase().replace(/ /g, '');
                            const isLight = ["white", "antique white", "mint", "ice blue", "peach", "apricot", "canary yellow", "new peach", "new blue", "cornflower", "mist blue", "watermelon pink", "lilac", "light pink", "lavender grey", "lavender", "sky blue", "azure", "pistachio", "clay", "stone", "grey pink", "lilac purple", "desert gold", "gold", "plum", "pebble", "shiny pink", "shiny blue", "shiny purple", "mellow", "flash", "pine green", "cactus", "grapefruit", "sierra blue", "forest blue", "deep navy", "deep purple", "pomegranate", "maroon grape", "cosmos", "spearmint", "dragon fruit", "papaya", "atrovirens", "black currant", "plum", "rose red", "shiny pink", "shiny purple", "shiny blue", "army green", "cosmos", "spearmint", "dragon fruit", "papaya", "canary yellow", "mellow", "watermelon pink", "cornflower", "atrovirens", "pine green", "black currant", "plum", "sky blue", "pomegranate", "cactus", "grapefruit", "sierra blue", "forest blue", "neon yellow", "blue horizon", "new peach", "new blue", "deep navy", "deep purple", "clay", "pistachio", "lilac purple", "grey pink", "titanium gery", "dark brown", "desert gold"];
                            const borderStyle = isLight.includes(color.toLowerCase()) ? { border: '1.5px solid #888' } : {};
                            return (
                              <div key={color + idx} className="flex items-center space-x-2">
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                  <Checkbox
                                    checked={field.value.includes(color)}
                                    onCheckedChange={(checked) => {
                                      const updatedColors = checked
                                        ? [...field.value, color]
                                        : field.value.filter((c: string) => c !== color);
                                      field.onChange(updatedColors);
                                    }}
                                    className="h-5 w-5 border border-gray-300"
                                    style={{ backgroundColor: colorBg, ...borderStyle }}
                                  />
                                </span>
                                <Label className="text-sm text-gray-600 min-w-[4rem]">{color}</Label>
                              </div>
                            );
                          })}
                        </div>
                        {typeof errors.colors?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.colors.message}</p>}
                        {field.value.length > 0 && (
                          <div className="mt-2 text-sm text-gray-700">
                            Selected colors: {field.value.join(', ')}
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </>)}

            {/* Product Images */}
            {sectionBox(<>
              {sectionTitle('Product Images')}
              
              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFrontImageChange}
                className="hidden"
                id="front-image-upload"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleBackImageChange}
                className="hidden"
                id="back-image-upload"
              />
              
              <div className="flex gap-4 items-center mb-4">
                <div className="flex flex-col items-center">
                  <span className="mb-1 font-semibold text-gray-700">Front Image</span>
                  {!frontImagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors w-24 h-24 flex items-center justify-center">
                      <label htmlFor="front-image-upload" className="cursor-pointer">
                        <span className="text-xs text-gray-500">Upload</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      {frontImagePreview && (
                        <Image
                          src={frontImagePreview}
                          alt="Front Preview"
                          width={96}
                          height={96}
                          className="h-24 w-24 object-cover rounded border"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeFrontImage}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-1 font-semibold text-gray-700">Back Image</span>
                  {!backImagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors w-24 h-24 flex items-center justify-center">
                      <label htmlFor="back-image-upload" className="cursor-pointer">
                        <span className="text-xs text-gray-500">Upload</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      {backImagePreview && (
                        <Image
                          src={backImagePreview}
                          alt="Back Preview"
                          width={96}
                          height={96}
                          className="h-24 w-24 object-cover rounded border"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeBackImage}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>)}

            {/* Discount and Quantity */}
            {sectionBox(<>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="discount" className="text-base font-semibold text-gray-800">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register("discount")}
                    placeholder="Discount value"
                    className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    disabled
                  />
                </div>
              </div>
            </>)}
          </form>
          )}
        </div>
        <SheetFooter className="flex justify-end space-x-3 pt-2 pb-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditProduct;