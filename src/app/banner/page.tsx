"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BannerCard from '@/components/custom/BannerCard';
import AddBanner, { AddBannerFormData } from '@/components/custom/AddBanner';
import EditBanner, { EditBannerFormData } from '@/components/custom/EditBanner';
import DeleteBannerDialog from '@/components/custom/DeleteBannerDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllHeroBanners, 
  insertHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  type HeroBanner,
  type CreateHeroBannerData,
  type UpdateHeroBannerData
} from '@/lib/db/banner';
import { toast } from 'sonner';

function BannerPage() {
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);
  const queryClient = useQueryClient();

  // Fetch all banners
  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ['hero-banners'],
    queryFn: getAllHeroBanners,
  });

  // Insert new banner mutation
  const insertMutation = useMutation({
    mutationFn: insertHeroBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-banners'] });
      toast.success('Banner added successfully!');
      setIsAddBannerOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to add banner');
      console.error('Error adding banner:', error);
    },
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: updateHeroBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-banners'] });
      toast.success('Banner updated successfully!');
      setIsEditBannerOpen(false);
      setSelectedBanner(null);
    },
    onError: (error) => {
      toast.error('Failed to update banner');
      console.error('Error updating banner:', error);
    },
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) => 
      deleteHeroBanner(id, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-banners'] });
      toast.success('Banner deleted successfully!');
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete banner');
      console.error('Error deleting banner:', error);
    },
  });

  const handleEdit = (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      setSelectedBanner(banner);
      setIsEditBannerOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      setBannerToDelete(banner);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (bannerToDelete) {
      deleteMutation.mutate({ 
        id: bannerToDelete.id, 
        imageUrl: bannerToDelete.image_url 
      });
    }
  };

  const handleAddNew = () => {
    setIsAddBannerOpen(true);
  };

  const handleSubmitBanner = (data: AddBannerFormData) => {
    if (!data.imageFile) {
      toast.error('Please select an image');
      return;
    }
    
    const bannerData: CreateHeroBannerData = {
      imageFile: data.imageFile,
      linkUrl: data.linkUrl,
      brand: data.brand,
      category: data.category,
      customUrlAdded: data.customUrlAdded,
    };
    
    insertMutation.mutate(bannerData);
  };

  const handleUpdateBanner = (data: EditBannerFormData) => {
    if (!selectedBanner) {
      toast.error('No banner selected for editing');
      return;
    }
    
    const bannerData: UpdateHeroBannerData = {
      id: selectedBanner.id,
      imageFile: data.imageFile,
      linkUrl: data.linkUrl,
      brand: data.brand,
      category: data.category,
      customUrlAdded: data.customUrlAdded,
    };
    
    updateMutation.mutate(bannerData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading banners: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Hero Images with URLs</h1>
          <p className="text-gray-600 mt-1">Manage your banner images and their associated links</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Hero
        </Button>
      </div>

      {/* Horizontal Line */}
      <hr className="border-gray-200" />

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {banners.map((banner) => (
          <BannerCard
            key={banner.id}
            id={banner.id}
            title="Banner"
            imageUrl={banner.image_url}
            linkUrl={banner.link_url}
            isActive={!banner.is_deleted}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State (if no banners) */}
      {banners.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
          <p className="text-gray-600 mb-4">Create your first banner to get started</p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Hero
          </Button>
        </div>
      )}

      {/* Add Banner Sheet */}
      <AddBanner
        open={isAddBannerOpen}
        onOpenChange={setIsAddBannerOpen}
        onSubmit={handleSubmitBanner}
      />

      {/* Edit Banner Sheet */}
      <EditBanner
        open={isEditBannerOpen}
        onOpenChange={setIsEditBannerOpen}
        onSubmit={handleUpdateBanner}
        bannerData={selectedBanner}
      />

      {/* Delete Banner Dialog */}
      <DeleteBannerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        bannerTitle={bannerToDelete ? `"${bannerToDelete.link_url}"` : 'this banner'}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BannerPage;