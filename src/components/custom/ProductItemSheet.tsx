import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';

type Product = {
  name: string;
  image: string;
  discount?: number;
};

type ProductItem = {
  products?: Product;
  quantity: number;
  price: number;
  discount?: number;
  models: string[];
  colors: string[];
  total_amount: number;
};

interface ProductItemSheetProps {
  item: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductItemSheet({ item, isOpen, onClose }: ProductItemSheetProps) {
  if (!item) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatArrayValues = (arr: string[]) => {
    if (!arr || arr.length === 0) return '--';
    return arr.map(val => val.replace(/\[\]"]/g, '')).join(', ');
  };

  const rows = [
    {
      label: 'Product Name',
      value: item.products?.name,
      valueClass: 'font-semibold text-gray-900',
    },
    {
      label: 'Quantity',
      value: item.quantity,
    },
    {
      label: 'Price',
      value: formatCurrency(item.price),
    },
    {
      label: 'Discount',
      value: typeof item.products?.discount === 'number' ? `${item.products.discount}%` : '--',
    },
    {
      label: 'Models',
      value: formatArrayValues(item.models),
    },
    {
      label: 'Colors',
      value: formatArrayValues(item.colors),
    },
    {
      label: 'Total Amount',
      value: formatCurrency(item.total_amount),
      valueClass: 'font-semibold text-gray-900',
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">Product Item Details</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center space-y-4 px-4 pb-4">
          {item.products?.image ? (
            <Image
              src={item.products.image}
              alt={item.products.name}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 mb-2"
              onError={() => {}}
            />
          ) : (
            <Image
              src="https://via.placeholder.com/128x128?text=No+Image"
              alt="No Image"
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 mb-2"
            />
          )}
          <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
            {rows.map(row => (
              <div
                key={row.label}
                className="flex flex-col py-3 px-4"
              >
                <span className="text-xs font-medium text-gray-500 mb-1">{row.label}</span>
                <span className={`text-xs ${row.valueClass || 'text-gray-900'} break-words`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 