"use client";
import React, { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import ProductItemSheet from './ProductItemSheet';
import { acceptOrder, cancelOrder } from '@/lib/db/orders';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  colors: string[];
  models: string[];
  image: string;
}

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  total_amount: number;
  colors: string[];
  models: string[];
  products: Product;
}

interface User {
  id: string;
  email: string;
  phone_number: string;
  address: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  status: boolean;
  track_id: string;
  users: User;
  order_items?: OrderItem[];
}

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsSheet({ 
  order, 
  isOpen, 
  onClose
}: OrderDetailsSheetProps) {
  const [selectedProductItem, setSelectedProductItem] = useState<OrderItem | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [trackIdInput, setTrackIdInput] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCanceled, setIsCanceled] = useState(order?.status === false && order?.track_id === null);
  
  const queryClient = useQueryClient();
  
  const acceptOrderMutation = useMutation({
    mutationFn: ({ orderId, trackId }: { orderId: string; trackId: string }) => 
      acceptOrder(orderId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setAcceptDialogOpen(false);
      setTrackIdInput('');
    },
    onError: (error) => {
      console.error('Error accepting order:', error);
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancelDialogOpen(false);
      setIsCanceled(true);
    },
    onError: (error) => {
      console.error('Error canceling order:', error);
    }
  });

  const handleAcceptOrder = useCallback(() => {
    if (order && trackIdInput.trim()) {
      acceptOrderMutation.mutate({
        orderId: order.id,
        trackId: trackIdInput.trim()
      });
    }
  }, [order, trackIdInput, acceptOrderMutation]);

  const handleCancelOrder = useCallback(() => {
    if (order) {
      cancelOrderMutation.mutate({ orderId: order.id });
    }
  }, [order, cancelOrderMutation]);

  const handleViewProductDetails = useCallback((item: OrderItem) => {
    setSelectedProductItem(item);
    setIsProductSheetOpen(true);
  }, []);

  const handleCloseProductSheet = useCallback(() => {
    setIsProductSheetOpen(false);
    setSelectedProductItem(null);
  }, []);

  const handleCloseAcceptDialog = useCallback(() => {
    setAcceptDialogOpen(false);
    setTrackIdInput('');
  }, []);

  const handleCloseCancelDialog = useCallback(() => {
    setCancelDialogOpen(false);
  }, []);

  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDiscount = (discount?: number) => {
    if (!discount) return '--';
    return `${discount}%`;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-2xl font-bold">Order Details</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="text-sm text-gray-900">{order.id.split('-').pop()}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Track ID</p>
                    <p className="text-sm text-gray-900">{order.track_id || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="text-sm text-gray-900">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge variant={order.status ? "default" : "secondary"}>
                      {order.status ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{order.users?.email || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-sm text-gray-900">{order.users?.phone_number || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900 text-right max-w-xs">{order.users?.address || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="w-full rounded-lg border border-gray-200 bg-white">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[60px] text-xs">Image</TableHead>
                          <TableHead className="w-[180px] text-xs">Product Name</TableHead>
                          <TableHead className="w-[80px] text-xs">Brand</TableHead>
                          <TableHead className="w-[80px] text-xs">Price</TableHead>
                          <TableHead className="w-[60px] text-xs">Qty</TableHead>
                          <TableHead className="w-[80px] text-xs">Discount</TableHead>
                          <TableHead className="w-[80px] text-xs">Color</TableHead>
                          <TableHead className="w-[80px] text-xs">Model</TableHead>
                          <TableHead className="w-[80px] text-xs">Total</TableHead>
                          <TableHead className="w-[40px] text-xs"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.order_items.map((item, index) => (
                          <TableRow key={item.id || index} className="hover:bg-gray-50">
                            <TableCell className="py-2">
                              {item.products?.image ? (
                                <Image
                                  src={item.products.image}
                                  alt={item.products.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded border border-gray-200"
                                />
                              ) : (
                                <Image
                                  src="https://via.placeholder.com/48x48?text=No+Image"
                                  alt="No Image"
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded border border-gray-200"
                                />
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-medium text-gray-900 truncate max-w-[160px] text-xs">
                                      {item.products?.name}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{item.products?.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-gray-900 text-xs py-2">
                              {item.products?.brand}
                            </TableCell>
                            <TableCell className="text-gray-900 font-semibold text-xs py-2">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-gray-900 text-xs py-2">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-gray-900 text-xs py-2">
                              {formatDiscount(item.products?.discount)}
                            </TableCell>
                            <TableCell className="text-gray-900 text-xs py-2">
                              {item.colors?.[0] ? item.colors[0].replace(/[\[\]"]/g, '') : '--'}
                            </TableCell>
                            <TableCell className="text-gray-900 text-xs py-2">
                              {item.models?.[0] ? item.models[0].replace(/[\[\]"]/g, '') : '--'}
                            </TableCell>
                            <TableCell className="text-gray-900 font-semibold text-xs py-2">
                              {formatCurrency(item.total_amount)}
                            </TableCell>
                            <TableCell className="text-xs py-2">
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => handleViewProductDetails(item)}
                                aria-label="More options"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No order items found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accept/Cancel Order Buttons or Status */}
            <div className="flex flex-col items-center pt-6">
              {isCanceled || (order.status === false && order.track_id === null) ? (
                <Badge variant="destructive" className="w-full max-w-xs text-center">Canceled!</Badge>
              ) : order.status ? (
                <Button disabled className="w-full max-w-xs">Order Already Accepted</Button>
              ) : (
                <div className="flex gap-2 w-full max-w-xs">
                  <Button 
                    onClick={() => setAcceptDialogOpen(true)}
                    className="flex-1"
                  >
                    Accept Order
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                    className="flex-1"
                  >
                    Cancel Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Item Sheet */}
      <ProductItemSheet
        item={selectedProductItem}
        isOpen={isProductSheetOpen}
        onClose={handleCloseProductSheet}
      />

      {/* Accept Order Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="track-id-input" className="block text-sm font-medium text-gray-700">
              Track ID
            </label>
            <Input
              id="track-id-input"
              value={trackIdInput}
              onChange={e => setTrackIdInput(e.target.value)}
              placeholder="Enter the tracking ID for this order"
              className="mt-1"
            />
            <p className="text-xs text-gray-500">
              Please provide a unique tracking ID for this order. This will be used to track the shipment and update the customer.
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseAcceptDialog}
              disabled={acceptOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOrder}
              disabled={!trackIdInput.trim() || acceptOrderMutation.isPending}
            >
              {acceptOrderMutation.isPending ? 'Accepting...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Are you sure you want to cancel this order? This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseCancelDialog}
              disabled={cancelOrderMutation.isPending}
            >
              No, Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelOrderMutation.isPending}
            >
              {cancelOrderMutation.isPending ? 'Canceling...' : 'Yes, Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 