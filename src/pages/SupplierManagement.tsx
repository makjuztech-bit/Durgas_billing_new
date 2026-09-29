import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { Supplier } from '@/types';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { SupplierFormDialog } from '@/components/suppliers/SupplierFormDialog';
import { SupplierPaymentDialog } from '@/components/suppliers/SupplierPaymentDialog';
import { SupplierHistoryDialog } from '@/components/suppliers/SupplierHistoryDialog';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, sarees } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({});

  // Payment Dialog State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activePaymentSupplier, setActivePaymentSupplier] = useState<Supplier | null>(null);

  // Purchase History Dialog State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistorySupplier, setActiveHistorySupplier] = useState<Supplier | null>(null);

  const handleSave = async () => {
    if (!supplierForm.name) {
      toast.error('Supplier name is required');
      return;
    }

    const supplierData = {
      name: supplierForm.name || '',
      contactPerson: supplierForm.contactPerson || '',
      mobile: supplierForm.mobile || '',
      gstin: supplierForm.gstin || '',
      location: supplierForm.location || '',
      pendingDue: supplierForm.pendingDue || 0,
    };

    if (isEditing && supplierForm.id) {
      await updateSupplier(supplierForm.id, supplierData);
      toast.success('Supplier updated successfully');
    } else {
      await addSupplier(supplierData as Supplier);
      toast.success('Supplier added successfully');
    }

    setIsAddOpen(false);
    setIsEditing(false);
    setSupplierForm({});
  };

  const handleEdit = (supplier: Supplier) => {
    setSupplierForm(supplier);
    setIsEditing(true);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      await deleteSupplier(id);
      toast.success('Supplier deleted');
    }
  };

  const handleRecordPayment = (supplier: Supplier) => {
    setActivePaymentSupplier(supplier);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async (supplierId: string, paymentAmt: number) => {
    const target = suppliers.find((s) => s.id === supplierId);
    if (!target) return;
    const newDue = Math.max(0, (target.pendingDue || 0) - paymentAmt);
    await updateSupplier(supplierId, { pendingDue: newDue });
    toast.success(
      `Payment of ₹${paymentAmt.toLocaleString()} recorded. Remaining due: ₹${newDue.toLocaleString()}`
    );
  };

  const handleHistory = (supplier: Supplier) => {
    setActiveHistorySupplier(supplier);
    setIsHistoryOpen(true);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPayable = filteredSuppliers.reduce((sum, s) => sum + (s.pendingDue || 0), 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Suppliers</h1>
          <p className="text-muted-foreground">Manage vendors, procurement history, and payments.</p>
        </div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setSupplierForm({});
            setIsAddOpen(true);
          }}
          className="bg-primary shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        {/* Main List */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <CardTitle className="text-base font-bold font-display">Registered Suppliers</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  className="pl-8 h-8 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <SupplierTable
              suppliers={filteredSuppliers}
              onEdit={handleEdit}
              onHistory={handleHistory}
              onRecordPayment={handleRecordPayment}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Quick Stats Panel */}
        <div className="flex flex-col gap-4">
          <Card className="border-0 shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                ₹{totalPayable.toLocaleString('en-IN')}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Across {filteredSuppliers.filter((s) => s.pendingDue > 0).length} suppliers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Supplier Dialog */}
      <SupplierFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        isEditing={isEditing}
        supplier={supplierForm}
        setSupplier={setSupplierForm}
        onSave={handleSave}
      />

      {/* Record Payment Dialog */}
      <SupplierPaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        supplier={activePaymentSupplier}
        onConfirm={handleConfirmPayment}
      />

      {/* Purchase History Dialog */}
      <SupplierHistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        supplier={activeHistorySupplier}
        products={sarees}
      />
    </div>
  );
};

export default SupplierManagement;
