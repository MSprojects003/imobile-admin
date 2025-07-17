import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addDiscount } from '@/lib/db/products';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProductById } from '@/hooks/use-product-by-id';
import Image from 'next/image';

interface AddDiscountProps {
  open: boolean;
  onClose: () => void;
  onSave: (discount: number) => void;
  initialDiscount?: number;
  productId: string;
}

const sectionTitle = (title: string) => (
  <div className="text-lg font-semibold text-gray-700 mb-2 mt-6">{title}</div>
);

const AddDiscount: React.FC<AddDiscountProps> = ({ open, onClose, onSave, initialDiscount = 0, productId }) => {
  const [discount, setDiscount] = useState<number>(initialDiscount);
  const { data: product, isLoading, error } = useProductById(productId);

  const mutation = useMutation({
    mutationFn: (newDiscount: number) => addDiscount(productId, newDiscount),
    onSuccess: () => {
      toast.success('Discount added successfully');
      onSave(discount);
      onClose();
    },
    onError: () => {
      toast.error('Failed to update discount');
    },
  });

  const handleSave = () => {
    mutation.mutate(discount);
  };

  // Map back_image to backImage for compatibility
  const displayProduct = product ? { ...product, backImage: product.backImage || product.back_image } : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[500px] bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-gray-800">Add Discount</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="text-center py-8">Loading product details...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Failed to load product details.</div>
        ) : !displayProduct ? (
          <div className="text-center py-8">No product found.</div>
        ) : (
          <>
            {/* Product Basic Details */}
            {sectionTitle('Product Basic Details')}
            <div className="grid grid-cols-1 gap-2 mb-2">
              <div><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-900">{displayProduct.name}</span></div>
              <div><span className="font-medium text-gray-600">Price:</span> <span className="text-gray-900">${displayProduct.price?.toFixed(2)}</span></div>
              <div><span className="font-medium text-gray-600">Description:</span> <span className="text-gray-900">{displayProduct.description}</span></div>
            </div>

            {/* Product Category */}
            {sectionTitle('Product Category')}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div><span className="font-medium text-gray-600">Brand:</span> <span className="text-gray-900">{displayProduct.brand}</span></div>
              <div><span className="font-medium text-gray-600">Category:</span> <span className="text-gray-900">{displayProduct.category}</span></div>
            </div>

            {/* Product Metadata */}
            {sectionTitle('Product Metadata')}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <span className="font-medium text-gray-600">Models:</span>
                <span className="text-gray-900"> {Array.isArray(displayProduct.models) ? displayProduct.models.join(', ') : ''}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Colors:</span>
                <span className="text-gray-900"> {Array.isArray(displayProduct.colors) ? displayProduct.colors.join(', ') : ''}</span>
              </div>
            </div>

            {/* Product Images */}
            {sectionTitle('Product Images')}
            <div className="flex gap-4 items-center mb-4">
              <div className="flex flex-col items-center">
                <span className="mb-1 font-medium text-gray-600">Front Image</span>
                {displayProduct.image ? (
                  <Image src={displayProduct.image} alt="Front" width={80} height={80} className="h-20 w-20 object-cover rounded border mb-1" />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
                <Button size="sm" variant="outline" className="mt-1" disabled>
                  Front Image
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1 font-medium text-gray-600">Back Image</span>
                {displayProduct.backImage ? (
                  <Image src={displayProduct.backImage} alt="Back" width={80} height={80} className="h-20 w-20 object-cover rounded border mb-1" />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
                <Button size="sm" variant="outline" className="mt-1" disabled>
                  Back Image
                </Button>
              </div>
            </div>

            {/* Discount Input */}
            <div className="mt-8 space-y-2">
              <label className="block text-gray-700 font-medium mb-2">Enter Discount Value</label>
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
                placeholder="Discount value"
                disabled={mutation.status === 'pending'}
              />
              <Button className="w-full mt-4" onClick={handleSave} disabled={mutation.status === 'pending'}>
                {mutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AddDiscount;