"use client";

import React, { useState } from "react";
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
import { PlusCircle } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { insertProduct } from '@/lib/db/products';
import type { ProductInput } from '@/lib/db/products';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";

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
  "Pebble", "Azure", "Camellia", "Mist Blue", "Flamingo", "Lavender Grey", "Gold", "Peach", "Chinese Red",   "Brown",
  "Purple", "Olive", "Cobalt", "Rose Red", "Shiny Pink", "Shiny Purple", "Green", "Flash", "Maroon Grape", "Shiny Blue",
  "Army Green", "Cosmos", "Spearmint", "Dragon Fruit", "Papaya", "Canary Yellow", "Mellow", "Watermelon Pink", "Cornflower", "Atrovirens", "Pine green",
  "Black Currant", "Plum", "Sky blue", "Pomegranate", "Cactus", "Grapefruit", "Sierra Blue", "Forest Blue", "Neon Yellow", "Blue Horizon", "New peach",
  "New blue", "Deep navy", "deep purple", "clay", "pistachio", "lilac purple", "grey pink", "Titanium Gery", "Dark Brown", "Desert gold"
];

type ProductFormData = {
  name: string;
  price: string;
  description: string;
  quantity: string;
  category: string;
  brand: string;
  models: string[];
  colors: string[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  brand: string;
  models: string[];
  colors: string[];
  image?: File | null;
  backImage?: File | null;
};

const AddProducts = ({ onAddProduct }: { onAddProduct: (product: Product) => void }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);
  const [customModels, setCustomModels] = useState<string[]>([""]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      price: "",
      description: "",
      quantity: "",
      category: "",
      brand: "",
      models: [],
      colors: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (newProduct: ProductInput) => {
      return await insertProduct(newProduct);
    },
    onSuccess: (data) => {
      toast.success('Product added successfully');
      onAddProduct(data);
      reset();
      setFrontImage(null);
      setBackImage(null);
      setIsSheetOpen(false);
    },
    onError: (error) => {
      console.error('Failed to add product:', error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const newProduct: ProductInput = {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description,
      quantity: parseInt(data.quantity),
      category: data.category,
      brand: data.brand,
      models: customModelMode ? customModels.filter(Boolean) : data.models,
      colors: data.colors,
      image: frontImage ? frontImage : '',
      backImage: backImage ? backImage : '',
    };
    console.log('New Product:', newProduct);
    mutation.mutate(newProduct);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Please select a valid image file");
    }
  };

  return (
    <>
      <Button
        className="bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
        onClick={() => setIsSheetOpen(true)}
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Product
      </Button>

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            reset();
            setFrontImage(null);
            setBackImage(null);
            setCustomModels([""]);
            setCustomModelMode(false);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold text-gray-800">Add New Product</SheetTitle>
              <SheetDescription className="text-gray-600">
                Fill in the details to add a new product to the inventory.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Product name is required" })}
                  placeholder="Enter product name"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  placeholder="Enter price"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Description is required" })}
                  placeholder="Enter product description"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: { value: 0, message: "Quantity must be positive" },
                  })}
                  placeholder="Enter quantity"
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</Label>
                <Controller
                  name="brand"
                  control={control}
                  rules={{ required: "Brand is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Models</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Custom</span>
                    <Switch checked={customModelMode} onCheckedChange={setCustomModelMode} />
                  </div>
                </div>
                {customModelMode ? (
                  <div className="flex flex-col gap-2">
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
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 p-4 rounded-lg bg-gray-50">
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
                                  : field.value.filter((m) => m !== model);
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
                {errors.models && <p className="text-red-500 text-sm mt-1">{errors.models.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Colors</Label>
                <Controller
                  name="colors"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 p-4 rounded-lg bg-gray-50">
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
                                      : field.value.filter((c) => c !== color);
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
                      {errors.colors && <p className="text-red-500 text-sm mt-1">{errors.colors.message}</p>}
                      {/* Selected colors display */}
                      {field.value.length > 0 && (
                        <div className="mt-2 text-sm text-gray-700">
                          Selected colors: {field.value.join(', ')}
                        </div>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Front Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setFrontImage)}
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {frontImage && (
                  <div className="text-sm text-gray-600 mt-1">Selected: {frontImage.name}</div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Back Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setBackImage)}
                  className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                {backImage && (
                  <div className="text-sm text-gray-600 mt-1">Selected: {backImage.name}</div>
                )}
              </div>
            </form>
          </div>
          <SheetFooter className="flex justify-end space-x-3 pt-2 pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setFrontImage(null);
                setBackImage(null);
                setIsSheetOpen(false);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
              disabled={mutation.status === 'pending'}
            >
              {mutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AddProducts;