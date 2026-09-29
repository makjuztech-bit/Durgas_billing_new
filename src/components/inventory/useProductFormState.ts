import { useState } from 'react';
import { Saree } from '@/types';

const INITIAL_FORM_DATA: Partial<Saree> = {
  sareeCode: '',
  barcode: '',
  name: '',
  nameTamil: '',
  category: 'bridal',
  brand: '',
  material: 'gold',
  zariType: 'pure_gold',
  borderType: 'classic',
  color: 'maroon',
  designType: 'traditional',
  purchasePrice: 0,
  sellingPrice: 0,
  mrp: 0,
  gstPercent: 5,
  stockType: 'bulk',
  stockQty: 10,
  rackLocation: '',
  supplier: '',
  description: '',
  status: 'available',
  images: [],
  department: 'Jewelry',
};

export function useProductFormState() {
  const [formData, setFormData] = useState<Partial<Saree>>(INITIAL_FORM_DATA);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const generateSareeCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `SK-${random}`;
    setFormData((prev) => ({
      ...prev,
      sareeCode: code,
      barcode: code,
    }));
  };

  const handleEdit = (saree: Saree) => {
    setFormData(saree);
    setIsEditing(true);
    setIsAddDialogOpen(true);
  };

  return {
    formData,
    setFormData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditing,
    setIsEditing,
    resetForm,
    generateSareeCode,
    handleEdit,
  };
}
