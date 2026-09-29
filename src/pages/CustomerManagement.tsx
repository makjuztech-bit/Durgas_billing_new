import React, { useState } from 'react';
import { Search, UserPlus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { Customer } from '@/types';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { CustomerStatsCards } from '@/components/customers/CustomerStatsCards';
import { useCustomerService } from '@/components/customers/useCustomerService';

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    customers,
    newCustomer,
    setNewCustomer,
    editingId,
    isAddOpen,
    setIsAddOpen,
    handleSaveCustomer,
    resetForm,
    handleEdit,
  } = useCustomerService();


  const handleSendOffer = (mobile: string) => {
    toast.success(`Offer sent to ${mobile} via WhatsApp`);
  };

  const handlePayment = (name: string) => {
    toast.info(`Opening payment collection for ${name}`);
  };

  const handleDownloadLedger = (name: string) => {
    toast.success(`Downloading ledger for ${name}`);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.place && c.place.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (

    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Customers</h1>
          <p className="text-muted-foreground">Manage customer profiles, purchase records, and dues.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/billing')}>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
          <Button
            className="bg-primary shadow-sm"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <CustomerStatsCards customers={customers} />


      {/* Main Table Card */}
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-display">Customer Directory</CardTitle>
              <CardDescription className="text-xs">Search client records and purchase ledger</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or city..."
                className="pl-8 h-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEdit}
            onSendOffer={handleSendOffer}
            onPayment={handlePayment}
            onDownloadLedger={handleDownloadLedger}
          />
        </CardContent>
      </Card>

      {/* Add / Edit Customer Dialog */}
      <CustomerFormDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
        isEditing={Boolean(editingId)}
        customer={newCustomer}
        setCustomer={setNewCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default CustomerManagement;
