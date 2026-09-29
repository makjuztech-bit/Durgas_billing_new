import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/config';
import { ReturnBill, ReturnCartItem, BillItem } from '@/components/returns/returnsTypes';

export function useReturnsExchange() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ReturnBill | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnCartItem[]>([]);
  const [verificationBarcode, setVerificationBarcode] = useState('');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'upi' | 'store_credit'>('cash');
  const [processing, setProcessing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/bills/search?query=${searchQuery}`);
      const data = await res.json();

      if (data.length > 0) {
        const bill = data[0];
        setSelectedBill(bill);
        setReturnItems(
          bill.items.map((item: BillItem) => ({
            ...item,
            returnQty: 1,
            condition: 'good',
            isVerified: false,
            selected: false,
          }))
        );
        toast.success('Bill found');
      } else {
        toast.error('No bill found with this number or mobile');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifyBarcode = () => {
    const item = returnItems.find((i) => i.barcode === verificationBarcode);
    if (item) {
      setReturnItems(
        returnItems.map((i) =>
          i.barcode === verificationBarcode ? { ...i, isVerified: true, selected: true } : i
        )
      );
      setVerificationBarcode('');
      toast.success(`${item.name} verified for return`);
    } else {
      toast.error('This item is not part of the selected bill');
    }
  };

  const toggleSelection = (barcode: string) => {
    setReturnItems(
      returnItems.map((i) => (i.barcode === barcode ? { ...i, selected: !i.selected } : i))
    );
  };

  const updateReturnQty = (barcode: string, qty: number) => {
    const item = selectedBill?.items.find((i) => i.barcode === barcode);
    if (!item) return;

    const maxProcessable = item.qty - item.returnedQty;
    const validQty = Math.max(1, Math.min(qty, maxProcessable));

    setReturnItems(
      returnItems.map((i) => (i.barcode === barcode ? { ...i, returnQty: validQty } : i))
    );
  };

  const updateCondition = (barcode: string, condition: 'good' | 'damaged' | 'altered') => {
    setReturnItems(
      returnItems.map((i) => (i.barcode === barcode ? { ...i, condition } : i))
    );
  };

  const calculateRefund = () => {
    return returnItems
      .filter((i) => i.selected)
      .reduce((sum, i) => {
        let refund = i.sellingPrice * i.returnQty;
        if (i.condition === 'damaged') refund *= 0.7;
        if (i.condition === 'altered') refund *= 0.5;
        return sum + refund;
      }, 0);
  };

  const handleProcessReturn = async () => {
    const itemsToProcess = returnItems.filter((i) => i.selected);
    if (itemsToProcess.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }

    const unverified = itemsToProcess.filter((i) => !i.isVerified);
    if (unverified.length > 0) {
      toast.error(`Please verify barcode for ${unverified[0].name}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalBillId: selectedBill?.id,
          itemsToReturn: itemsToProcess.map((i) => ({
            barcode: i.barcode,
            qty: i.returnQty,
            condition: i.condition,
            refundAmount: i.sellingPrice * i.returnQty,
          })),
          totalRefundAmount: calculateRefund(),
          refundMethod,
          processedBy: user?.name,
        }),
      });

      if (response.ok) {
        toast.success('Return processed successfully');
        setSelectedBill(null);
        setReturnItems([]);
        setSearchQuery('');
      } else {
        toast.error('Failed to process return');
      }
    } catch (error) {
      toast.error('Error processing return');
    } finally {
      setProcessing(false);
    }
  };

  return {
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
  };
}
