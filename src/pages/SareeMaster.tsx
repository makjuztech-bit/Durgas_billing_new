import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Saree } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { ProductTable } from '@/components/inventory/ProductTable';
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog';
import { ProductViewDialog } from '@/components/inventory/ProductViewDialog';
import { ProductImportDialog } from '@/components/inventory/ProductImportDialog';
import { A4BarcodePrintDialog } from '@/components/inventory/A4BarcodePrintDialog';
import { InventoryFilterToolbar } from '@/components/inventory/InventoryFilterToolbar';
import { exportInventoryToCsv, importInventoryRows } from '@/components/inventory/inventoryExportImport';
import { useProductFormState } from '@/components/inventory/useProductFormState';




export const SareeMaster: React.FC = () => {
  const navigate = useNavigate();
  const { sarees, addSaree, updateSaree } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Product inspection & print state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [isBarcodePrintOpen, setIsBarcodePrintOpen] = useState(false);
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Saree | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Form Data State hook
  const {
    formData,
    setFormData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditing,
    setIsEditing,
    resetForm,
    generateSareeCode,
    handleEdit,
  } = useProductFormState();

  const handleSave = async () => {
    if (!formData.name || !formData.sareeCode) {
      toast.error('Product Code and Name are required');
      return;
    }
    try {
      const dataToSave = { ...formData, barcode: formData.barcode || formData.sareeCode };
      if (isEditing && formData.id) {
        await updateSaree(formData.id, dataToSave);
        toast.success('Product updated successfully');
      } else {
        await addSaree(dataToSave as Saree);
        toast.success('Product added successfully');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleSaveAndPrint = async () => {
    await handleSave();
    if (formData) {
      setBarcodePrintProduct(formData as Saree);
      setIsBarcodePrintOpen(true);
    }
  };


  const handleImportComplete = (importedList: Partial<Saree>[]) => {
    importInventoryRows(importedList, addSaree);
  };


  const filteredSarees = sarees.filter((saree) => {
    const matchesSearch =
      saree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      saree.sareeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      saree.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || saree.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || saree.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const togglePrintSelection = (id: string) => {
    setSelectedForPrint((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenBarcodePrint = (product: Saree) => {
    setBarcodePrintProduct(product);
    setIsBarcodePrintOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Product Master</h1>
          <p className="mt-1 text-muted-foreground">Manage your apparel and inventory catalog</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => navigate('/billing')}>
            <Plus className="mr-2 h-4 w-4" /> New Bill
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => exportInventoryToCsv(sarees)}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            variant="default"
            className="bg-primary text-primary-foreground shadow-sm"
            onClick={() => { resetForm(); generateSareeCode(); setIsEditing(false); setIsAddDialogOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <InventoryFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Product Inventory Table */}
      <ProductTable
        products={filteredSarees}
        selectedForPrint={selectedForPrint}
        onTogglePrint={togglePrintSelection}
        onView={(p) => {
          setSelectedSaree(p);
          setIsViewDialogOpen(true);
        }}
        onEdit={handleEdit}
        onPrint={handleOpenBarcodePrint}
      />

      {/* Add / Edit Product Form Dialog */}
      <ProductFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onSaveAndPrint={handleSaveAndPrint}
        onReset={resetForm}
        onGenerateCode={generateSareeCode}
      />

      {/* Product Details View Dialog */}
      <ProductViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        product={selectedSaree}
      />

      {/* CSV Import Dialog */}
      <ProductImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      {/* Multi-Page & Thermal Barcode Print Dialog */}
      <A4BarcodePrintDialog
        open={isBarcodePrintOpen}
        onOpenChange={setIsBarcodePrintOpen}
        product={barcodePrintProduct}
        allProducts={sarees}
      />
    </div>
  );
};

export default SareeMaster;
