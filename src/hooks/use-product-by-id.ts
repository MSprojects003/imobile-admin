import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/lib/db/products';

export function useProductById(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => (productId ? getProductById(productId) : Promise.resolve(null)),
    enabled: !!productId,
  });
} 