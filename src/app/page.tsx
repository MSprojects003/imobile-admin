"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Trash2, Edit, Eye, SquareArrowRightIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddProducts from "@/components/custom/AddProducts";
import EditProduct from "@/components/custom/EditProduct";
import ViewProductDetails from "@/components/custom/ViewProductDetails";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { softDeleteProduct } from "@/lib/db/products";
import AddDiscount from "@/components/custom/AddDiscount";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;
  colors: string[];
  models: string[];
  price: number;
  quantity: number;
  discount?: number;
  description: string;
  back_image?: string | null;
}

const ITEMS_PER_PAGE = 4;

export default function ProductInventoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [discountSheetOpen, setDiscountSheetOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Fetch products from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: softDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    },
  });

  // Search filter
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    deleteMutation.mutate(selectedProduct.id);
  };

  const handleAddProduct = () => {
    // Products will be refreshed automatically by React Query
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditSheetOpen(true);
  };

  const handleViewClick = (product: Product) => {
    setViewingProduct(product);
    setViewSheetOpen(true);
  };

  const handleAddDiscountClick = (product: Product) => {
    setDiscountProduct(product);
    setDiscountSheetOpen(true);
  };

  // Skeleton row component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell className="py-4">
        <div className="flex items-center justify-center">
          <Skeleton className="h-14 w-14 rounded" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3 w-8 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 ml-auto rounded" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Product Inventory</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <Input
              placeholder="Search by product name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="max-w-md w-full"
            />
          </div>
          <div className="flex space-x-3">
            <AddProducts onAddProduct={handleAddProduct} />
          </div>
        </div>
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-auto px-8 py-4 w-full">
        <div className="w-full rounded-lg border border-gray-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-[120px]">Image</TableHead>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Show skeleton rows while loading
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : (
                currentProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 object-cover rounded border"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                        {truncateText(product.name, 30)}
                      </div>
                       
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 capitalize">
                        {product.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{product.brand}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Colors:</span>{' '}
                                {truncateText(product.colors.join(", "), 20)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{product.colors.join(", ")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Models:</span>{' '}
                                {truncateText(product.models.join(", "), 20)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{product.models.join(", ")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {product.discount && product.discount > 0 ? (
                          <>
                            <div className="text-sm font-semibold text-gray-600 line-through decoration-1">
                              Rs.{product.price.toFixed(2)}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              Rs.{(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {product.price && product.price !== 0 ? `Rs.${product.price.toFixed(2)}` : '-'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {product.quantity === 0 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-x1" />
                        ) : product.quantity < 20 ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                        ) : null}
                        <span
                          className={`text-sm ${
                            product.quantity === 0
                              ? "text-red-600 font-medium"
                              : product.quantity < 20
                              ? "text-amber-600 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {product.quantity} units
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                    {product.discount && (
                        <div className="text-xs text-green-600">
                          {product.discount}% off
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <SquareArrowRightIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleViewClick(product)}>
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleEditClick(product)}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleAddDiscountClick(product)}>
                            <span className="h-4 w-4">%</span>
                            Add Discount
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product 
              <span className="font-semibold"> {selectedProduct?.name}</span> and remove all 
              associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fixed Footer with Pagination */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-8 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <PaginationPrevious />
              </Button>
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
              >
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {viewingProduct && (
        <ViewProductDetails
          open={viewSheetOpen}
          productId={viewingProduct.id}
          onClose={() => setViewSheetOpen(false)}
        />
      )}
      {editingProduct && (
        <EditProduct
          open={editSheetOpen}
          productId={editingProduct.id}
          onClose={() => setEditSheetOpen(false)}
        />
      )}
      <AddDiscount
        open={discountSheetOpen}
        onClose={() => setDiscountSheetOpen(false)}
        onSave={() => {
          setDiscountSheetOpen(false);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
        initialDiscount={discountProduct?.discount || 0}
        productId={discountProduct?.id || ''}
      />
    </div>
  );
}