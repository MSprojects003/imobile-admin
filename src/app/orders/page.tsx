"use client";
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { getAllorders } from '@/lib/db/orders';
import OrderDetailsSheet from '@/components/custom/OrderDetailsSheet';
import type { Order } from '@/types/order';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllorders,
  });

  const filteredOrders = useMemo(() => {
    let data = orders;
    
    // Filter by status
    if (filter !== 'All') {
      data = data.filter(order => {
        if (filter === 'Completed') return order.status === true;
        if (filter === 'Pending') return order.status === false;
        return true;
      });
    }
    
    // Filter by search (order ID or customer email)
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      data = data.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.users?.email?.toLowerCase().includes(searchTerm) ||
        order.track_id?.toLowerCase().includes(searchTerm)
      );
    }
    
    return data;
  }, [orders, search, filter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount); // Display exact value without conversion
  };

  // Handle order details view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error loading orders: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
          </div>
          <div className="flex-1 flex justify-center">
            <Input
              placeholder="Search by Order ID, Email, or Track ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="max-w-md w-full"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant={filter === 'All' ? 'default' : 'outline'}
              onClick={() => { setFilter('All'); setPage(1); }}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'Completed' ? 'default' : 'outline'}
              onClick={() => { setFilter('Completed'); setPage(1); }}
              size="sm"
            >
              Completed
            </Button>
            <Button
              variant={filter === 'Pending' ? 'default' : 'outline'}
              onClick={() => { setFilter('Pending'); setPage(1); }}
              size="sm"
            >
              Pending
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 overflow-auto px-8 py-4 w-full">
        <div className="w-full rounded-lg border border-gray-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="w-[200px]">Order ID</TableHead>
                <TableHead className="w-[150px]">Track ID</TableHead>
                <TableHead className="w-[150px]">Order Date</TableHead>
                <TableHead className="w-[250px]">Customer Email</TableHead>
                <TableHead className="w-[200px]">Customer Address</TableHead>
                <TableHead className="w-[150px]">Total Amount</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {order.id.split('-').pop() || order.id}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {order.track_id || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {order.users?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {order.users?.address || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === true 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === true ? 'Completed' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrderDetails(order)}>
                            View Details
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

      {/* Fixed Footer with Pagination */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-8 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <PaginationPrevious />
              </Button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <PaginationNext />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onClose={() => {
          setIsOrderDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}