import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ReturnSearchCard } from '@/components/returns/ReturnSearchCard';
import { BillSummaryCard } from '@/components/returns/BillSummaryCard';
import { ReturnItemsTable } from '@/components/returns/ReturnItemsTable';
import { ReturnSettlementCard } from '@/components/returns/ReturnSettlementCard';
import { useReturnsExchange } from '@/components/returns/useReturnsExchange';

const ReturnsExchange: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    selectedBill,
    setSelectedBill,
    returnItems,
    verificationBarcode,
    setVerificationBarcode,
    refundMethod,
    setRefundMethod,
    processing,
    handleSearch,
    handleVerifyBarcode,
    toggleSelection,
    updateReturnQty,
    updateCondition,
    calculateRefund,
    handleProcessReturn,
  } = useReturnsExchange();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">
            Sales Return / Exchange
          </h1>
          <p className="text-muted-foreground">Search bills and process returns/exchanges securely.</p>
        </div>
        {selectedBill && (
          <Button variant="outline" onClick={() => setSelectedBill(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Reset Search
          </Button>
        )}
      </div>

      {!selectedBill ? (
        <ReturnSearchCard
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      ) : (
        <div className="grid gap-6">
          <BillSummaryCard
            selectedBill={selectedBill}
            verificationBarcode={verificationBarcode}
            setVerificationBarcode={setVerificationBarcode}
            onVerifyBarcode={handleVerifyBarcode}
          />

          <ReturnItemsTable
            returnItems={returnItems}
            onToggleSelection={toggleSelection}
            onUpdateReturnQty={updateReturnQty}
            onUpdateCondition={updateCondition}
          />

          <ReturnSettlementCard
            refundMethod={refundMethod}
            setRefundMethod={setRefundMethod}
            refundAmount={calculateRefund()}
            onProcessReturn={handleProcessReturn}
            processing={processing}
          />
        </div>
      )}
    </div>
  );
};

export default ReturnsExchange;
