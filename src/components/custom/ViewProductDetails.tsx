import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProductById } from '@/hooks/use-product-by-id';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface ViewProductDetailsProps {
  open: boolean;
  productId: string | null;
  onClose: () => void;
}

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
  image: string;
  back_image?: string;
  backImage?: string;
  discount?: number;
};

const fieldLabels: { [key: string]: string } = {
  name: 'Product Name',
  price: 'Price',
  category: 'Category',
  brand: 'Brand',
  models: 'Models',
  colors: 'Colors',
  quantity: 'Stock',
  discount: 'Discount',
  image: 'Image',
  backImage: 'Back Image',
};

function truncateWithTooltip(value: string, maxLength: number) {
  if (value.length > maxLength) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer underline decoration-dotted">{value.slice(0, maxLength)}...</span>
          </TooltipTrigger>
          <TooltipContent>
            <span>{value}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return value;
}

const ViewProductDetails: React.FC<ViewProductDetailsProps> = ({ open, productId, onClose }) => {
  const { data: product, isLoading, error } = useProductById(productId);

  if (!open) return null;

  // Map back_image to backImage for compatibility
  const displayProduct: Product | null = product
    ? { ...product, backImage: (product as Product).backImage || (product as Product).back_image }
    : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[700px] bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-gray-800">Product Details</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Failed to load product details.</div>
        ) : !displayProduct ? (
          <div className="text-center py-8">No product found.</div>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(fieldLabels).map(([key, label]) => {
                if (key === 'description' || key === 'image' || key === 'backImage') return null;
                let value = (displayProduct as Record<string, unknown>)[key];
                // Ensure value is a string for rendering
                if (typeof value !== 'string' && typeof value !== 'number') value = '';
                if (key === 'models' || key === 'colors') {
                  const joined = Array.isArray(value) ? value.join(', ') : '';
                  return (
                    <div key={key} className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600 font-medium w-1/2 text-left">{label}</span>
                      <span className="text-gray-900 w-1/2 text-right font-semibold">
                        {truncateWithTooltip(joined, 24)}
                      </span>
                    </div>
                  );
                }
                if (Array.isArray(value)) value = value.join(', ');
                if (key === 'price') value = `$${displayProduct.price.toFixed(2)}`;
                if (key === 'discount' && (value === undefined || value === null || value === '')) return null;
                return (
                  <div key={key} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600 font-medium w-1/2 text-left">{label}</span>
                    <span className="text-gray-900 w-1/2 text-right font-semibold">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
              {/* Discount Price */}
              {typeof displayProduct.price === 'number' && typeof displayProduct.discount === 'number' && displayProduct.discount > 0 && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium w-1/2 text-left">Discount Price</span>
                  <span className="text-green-700 w-1/2 text-right font-semibold">
                    ${ (displayProduct.price - displayProduct.discount).toFixed(2) }
                  </span>
                </div>
              )}
              {/* Images */}
              {displayProduct.image && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium w-1/2 text-left">Image</span>
                  <span className="w-1/2 flex justify-end">
                    <Image src={displayProduct.image} alt={displayProduct.name} width={56} height={56} className="h-14 w-14 object-cover rounded border" />
                  </span>
                </div>
              )}
              {displayProduct.backImage && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium w-1/2 text-left">Back Image</span>
                  <span className="w-1/2 flex justify-end">
                    <Image src={displayProduct.backImage} alt={displayProduct.name + ' back'} width={56} height={56} className="h-14 w-14 object-cover rounded border" />
                  </span>
                </div>
              )}
            </div>
            {/* Description at the bottom */}
            <div className="mt-8">
              <div className="text-gray-600 font-medium mb-1">Description</div>
              <div className="text-gray-900 bg-gray-50 rounded p-3 border text-sm whitespace-pre-line">
                {displayProduct.description}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ViewProductDetails;