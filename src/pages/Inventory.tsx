import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Saree } from '@/types';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { InventoryToolbar } from '@/components/inventory/InventoryToolbar';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddEditProductModal } from '@/components/inventory/AddEditProductModal';
import { QuickRestockModal } from '@/components/inventory/QuickRestockModal';
import { A4BarcodePrintDialog } from '@/components/inventory/A4BarcodePrintDialog';
import { CSVImportModal } from '@/components/inventory/CSVImportModal';
import { unparseCSV } from '@/lib/csv';
import { API_URL } from '@/lib/config';
import { toast } from 'sonner';

const Inventory: React.FC = () => {
  const { sarees, addSaree, updateSaree, deleteSaree, adjustStock } = useData();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal Dialog States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Saree | null>(null);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<Saree | null>(null);

  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printingProduct, setPrintingProduct] = useState<Saree | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filtered Items (Name, Barcode, Rack, Stock Status)
  const filteredProducts = useMemo(() => {
    return sarees.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.nameTamil && item.nameTamil.includes(searchTerm)) ||
        (item.rackLocation && item.rackLocation.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStock = true;
      const qty = item.stockQty !== undefined ? item.stockQty : 0;
      if (stockFilter === 'low') {
        matchesStock = qty > 0 && qty <= 3;
      } else if (stockFilter === 'out') {
        matchesStock = qty <= 0;
      } else if (stockFilter === 'in_stock') {
        matchesStock = qty > 3;
      }

      return matchesSearch && matchesStock;
    });
  }, [sarees, searchTerm, stockFilter]);

  // Handlers
  const handleOpenEdit = (product: Saree) => {
    setEditingItem(product);
    setIsEditOpen(true);
  };

  const handleOpenRestock = (product?: Saree) => {
    setRestockItem(product || null);
    setIsRestockOpen(true);
  };

  const handleOpenPrint = (product?: Saree) => {
    setPrintingProduct(product || null);
    setIsPrintDialogOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Saree>) => {
    if (editingItem && editingItem.id) {
      await updateSaree(editingItem.id, productData);
    } else {
      await addSaree(productData as Saree);
    }
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error('No products to export.');
      return;
    }
    
    // Format for export
    const exportData = filteredProducts.map(p => ({
      Product_Name: p.name,
      // Prefix with ="" to force Excel to treat it as string and prevent dropping leading zeros/scientific notation
      Barcode: p.barcode ? `="${p.barcode}"` : '',
      Price: p.sellingPrice || 0,
      Stock: p.stockQty !== undefined ? p.stockQty : 1,
      Category: p.category || '',
      Department: p.department || ''
    }));

    const csv = unparseCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (products: any[]) => {
    try {
      const response = await fetch(`${API_URL}/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Import failed');
      }
      
      const result = await response.json();
      toast.success(result.message || 'Import successful!');
      
      // Reload products if we had a function, or just trigger a reload
      window.location.reload(); 
    } catch (error: any) {
      toast.error(`Import API Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Inventory & Stock Control</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage product catalog, barcode generation, real-time stock levels, and quick restocks.
        </p>
      </div>

      {/* KPI Stats Overview */}
      <InventoryStats products={sarees} />

      {/* Action Toolbar */}
      <InventoryToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onOpenAddProduct={() => {
          setEditingItem(null);
          setIsAddProductOpen(true);
        }}
        onOpenRestock={() => handleOpenRestock()}
        onOpenPrintDialog={() => handleOpenPrint()}
        onExportCSV={handleExportCSV}
        onImportCSV={() => setIsImportModalOpen(true)}
      />

      {/* Catalog Table */}
      <InventoryTable
        products={filteredProducts}
        onEdit={handleOpenEdit}
        onRestock={handleOpenRestock}
        onPrintBarcode={handleOpenPrint}
        onDelete={deleteSaree}
      />

      {/* Add New Product Modal */}
      <AddEditProductModal
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSave={handleSaveProduct}
      />

      {/* Edit Product Modal */}
      <AddEditProductModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={editingItem}
        onSave={handleSaveProduct}
      />

      {/* Quick Restock (+Qty) Modal */}
      <QuickRestockModal
        open={isRestockOpen}
        onOpenChange={setIsRestockOpen}
        product={restockItem}
        allProducts={sarees}
        onRestock={adjustStock}
      />

      {/* A4 Barcode Printing Modal */}
      <A4BarcodePrintDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        product={printingProduct}
        allProducts={sarees}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={handleImportCSV}
      />
    </div>
  );
};

export default Inventory;
