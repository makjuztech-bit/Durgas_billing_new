import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { BillReceiptItem } from './BillReceipt';
import { computeBillCalculations } from '@/lib/billingCalculations';

export const DRAFT_STORAGE_KEY = 'durgas_active_bill_draft';

export interface ActiveBillDraft {
  customerName: string;
  customerMobile: string;
  customerPlace: string;
  paymentMethod: string;
  items: BillReceiptItem[];
  paperType: 'thermal' | 'a4';
}

export function useBillingState() {
  const { addBill, itemTrie, settings, sarees } = useData();

  const savedDraft = useMemo<ActiveBillDraft | null>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ActiveBillDraft) : null;
    } catch {
      return null;
    }
  }, []);

  const [customerName, setCustomerName] = useState(savedDraft?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState(savedDraft?.customerMobile || '');
  const [customerPlace, setCustomerPlace] = useState(savedDraft?.customerPlace || '');
  const [paymentMethod, setPaymentMethod] = useState(savedDraft?.paymentMethod || 'Cash');
  const [items, setItems] = useState<BillReceiptItem[]>(savedDraft?.items || []);
  const [paperType, setPaperType] = useState<'thermal' | 'a4'>(savedDraft?.paperType || 'thermal');

  // Sync draft to localStorage on every change
  useEffect(() => {
    const draft: ActiveBillDraft = { customerName, customerMobile, customerPlace, paymentMethod, items, paperType };
    try {
      if (items.length > 0 || customerName || customerMobile || customerPlace) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // non-blocking
    }
  }, [customerName, customerMobile, customerPlace, paymentMethod, items, paperType]);

  const calculations = useMemo(() => computeBillCalculations(items), [items]);

  const handleUpdateItem = (id: string, updates: Partial<BillReceiptItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddItem = (newItem: BillReceiptItem) => {
    setItems((prev) => {
      // If item with same barcode, ID, or name & price already exists, increment quantity
      const existingIdx = prev.findIndex(
        (i) =>
          (newItem.barcode && i.barcode && i.barcode.toLowerCase() === newItem.barcode.toLowerCase()) ||
          (newItem.id && i.id === newItem.id) ||
          (i.name.toLowerCase() === newItem.name.toLowerCase() && i.sellingPrice === newItem.sellingPrice)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.qty + (newItem.qty || 1);
        const base = newQty * existing.sellingPrice;
        const discAmt = base * ((existing.discountPercent || 0) / 100);
        const taxAmt = (base - discAmt) * ((existing.taxPercent || 0) / 100);
        updated[existingIdx] = {
          ...existing,
          qty: newQty,
          discountAmount: discAmt,
          taxAmount: taxAmt,
          total: base - discAmt + taxAmt,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const handleClearForm = () => {
    setItems([]);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerPlace('');
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.info('Billing form reset to fresh state.');
  };

  const handleSaveBill = async (printReceipt: boolean, printCallback?: () => void) => {
    if (items.length === 0) {
      toast.error('Add at least one item to save the bill.');
      return;
    }

    const billData = {
      id: Date.now().toString(),
      billNo: `BILL-${Date.now().toString().slice(-5)}`,
      items: calculations.items.map((i) => ({
        sareeId: i.id,
        name: i.name,
        barcode: i.barcode,
        qty: i.qty,
        sellingPrice: i.sellingPrice,
        discountPercent: i.discountPercent || 0,
        discountAmount: i.discountAmount || 0,
        taxPercent: i.taxPercent || 0,
        taxAmount: i.taxAmount || 0,
        total: i.total || i.qty * i.sellingPrice,
      })),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerMobile: customerMobile.trim(),
      customerPlace: customerPlace.trim(),
      subtotal: calculations.subTotal,
      discountAmount: calculations.totalDiscountAmount,
      taxAmount: calculations.totalTaxAmount,
      roundOff: calculations.roundOff,
      grandTotal: calculations.grandTotal,
      status: 'Paid',
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      await addBill(billData as any);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      if (printReceipt && printCallback) {
        printCallback();
      } else {
        toast.success(`Bill ${billData.billNo} saved successfully!`);
      }

      setItems([]);
      setCustomerName('');
      setCustomerMobile('');
      setCustomerPlace('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save bill.');
    }
  };

  const handleHoldBill = async () => {
    if (items.length === 0) {
      toast.error('Add at least one item to hold the bill.');
      return;
    }

    const billData = {
      id: Date.now().toString(),
      billNo: `HLD-${Date.now().toString().slice(-5)}`,
      items: calculations.items.map((i) => ({
        sareeId: i.id,
        name: i.name,
        barcode: i.barcode,
        qty: i.qty,
        sellingPrice: i.sellingPrice,
        discountPercent: i.discountPercent || 0,
        discountAmount: i.discountAmount || 0,
        taxPercent: i.taxPercent || 0,
        taxAmount: i.taxAmount || 0,
        total: i.total || i.qty * i.sellingPrice,
      })),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerMobile: customerMobile.trim(),
      customerPlace: customerPlace.trim(),
      subtotal: calculations.subTotal,
      discountAmount: calculations.totalDiscountAmount,
      taxAmount: calculations.totalTaxAmount,
      roundOff: calculations.roundOff,
      grandTotal: calculations.grandTotal,
      status: 'Hold',
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      await addBill(billData as any);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      toast.success(`Bill ${billData.billNo} placed on hold successfully!`);

      setItems([]);
      setCustomerName('');
      setCustomerMobile('');
      setCustomerPlace('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to hold bill.');
    }
  };

  return {
    customerName,
    setCustomerName,
    customerMobile,
    setCustomerMobile,
    customerPlace,
    setCustomerPlace,
    paymentMethod,
    setPaymentMethod,
    items,
    setItems,
    paperType,
    setPaperType,
    calculations,
    handleUpdateItem,
    handleRemoveItem,
    handleAddItem,
    handleClearForm,
    handleSaveBill,
    handleHoldBill,
    settings,
    sarees,
    itemTrie,
  };
}
