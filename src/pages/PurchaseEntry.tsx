import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';

import { PurchaseSupplierCard } from '@/components/purchase/PurchaseSupplierCard';
import { PurchaseItemEntryCard } from '@/components/purchase/PurchaseItemEntryCard';
import { PurchaseItemsTable } from '@/components/purchase/PurchaseItemsTable';
import { PurchaseSummaryCard } from '@/components/purchase/PurchaseSummaryCard';
import { PurchaseHistoryTable } from '@/components/purchase/PurchaseHistoryTable';
import { usePurchaseEntry } from '@/components/purchase/usePurchaseEntry';

const PurchaseEntry: React.FC = () => {
  const { suppliers, sarees } = useData();
  const {
    items,
    supplier,
    setSupplier,
    billNo,
    setBillNo,
    purchaseType,
    setPurchaseType,
    billDate,
    setBillDate,
    barcode,
    setBarcode,
    itemName,
    setItemName,
    category,
    setCategory,
    qty,
    setQty,
    costPrice,
    setCostPrice,
    mrp,
    setMrp,
    sellingPrice,
    setSellingPrice,
    handleAddItem,
    handleRemoveItem,
    paidAmount,
    setPaidAmount,
    paymentMethod,
    setPaymentMethod,
    purchaseHistory,
    isRefreshing,
    historySearch,
    setHistorySearch,
    fetchHistory,
    handleSavePurchase,
    handleUpdatePayment,
    totalAmount,
  } = usePurchaseEntry(sarees, suppliers);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display text-primary">
          Purchase Entry
        </h1>
        <p className="text-muted-foreground">Manage inward stock and supplier payments.</p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="new">New Purchase</TabsTrigger>
          <TabsTrigger value="history" onClick={fetchHistory}>
            Purchase History / Credit Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
              <PurchaseSupplierCard
                supplier={supplier}
                setSupplier={setSupplier}
                suppliers={suppliers}
                billNo={billNo}
                setBillNo={setBillNo}
                billDate={billDate}
                setBillDate={setBillDate}
                purchaseType={purchaseType}
                setPurchaseType={setPurchaseType}
              />

              <PurchaseItemEntryCard
                barcode={barcode}
                setBarcode={setBarcode}
                itemName={itemName}
                setItemName={setItemName}
                category={category}
                setCategory={setCategory}
                costPrice={costPrice}
                setCostPrice={setCostPrice}
                mrp={mrp}
                setMrp={setMrp}
                sellingPrice={sellingPrice}
                setSellingPrice={setSellingPrice}
                qty={qty}
                setQty={setQty}
                onAddItem={handleAddItem}
              />

              <PurchaseItemsTable items={items} onRemoveItem={handleRemoveItem} />
            </div>

            <div className="space-y-6">
              <PurchaseSummaryCard
                items={items}
                totalAmount={totalAmount}
                paidAmount={paidAmount}
                setPaidAmount={setPaidAmount}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onSavePurchase={handleSavePurchase}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PurchaseHistoryTable
            purchaseHistory={purchaseHistory}
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            onRefresh={fetchHistory}
            isRefreshing={isRefreshing}
            onUpdatePayment={handleUpdatePayment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseEntry;
