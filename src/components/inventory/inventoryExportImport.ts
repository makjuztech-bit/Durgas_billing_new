import { toast } from 'sonner';
import { Saree } from '@/types';

export function exportInventoryToCsv(sarees: Saree[]): void {
  if (sarees.length === 0) {
    toast.error('No products found to export');
    return;
  }
  const headers = [
    'Item Code',
    'Barcode',
    'Product Name',
    'Category',
    'Brand',
    'Purchase Price',
    'Selling Price',
    'MRP',
    'Stock Qty',
    'Status',
    'Rack Location',
    'Supplier',
  ];
  const rows = sarees.map((s) => [
    `"${s.sareeCode || ''}"`,
    `"${s.barcode || ''}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${s.category || ''}"`,
    `"${s.brand || ''}"`,
    s.purchasePrice || 0,
    s.sellingPrice || 0,
    s.mrp || 0,
    s.stockQty || 0,
    `"${s.status || 'available'}"`,
    `"${s.rackLocation || ''}"`,
    `"${s.supplier || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  toast.success(`Exported ${sarees.length} products to CSV`);
}

export async function importInventoryRows(
  importedList: Partial<Saree>[],
  addSaree: (saree: Saree) => Promise<any>
): Promise<void> {
  for (const item of importedList) {
    try {
      await addSaree({
        ...item,
        sareeCode: item.sareeCode || `SK-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: item.barcode || item.sareeCode || `SK-${Math.floor(1000 + Math.random() * 9000)}`,
        category: item.category || 'bridal',
        purchasePrice: item.purchasePrice || 0,
        sellingPrice: item.sellingPrice || 0,
        mrp: item.mrp || item.sellingPrice || 0,
        stockQty: item.stockQty || 1,
        status: 'available',
      } as Saree);
    } catch (err) {
      console.error('Import failed for row', item);
    }
  }
}

