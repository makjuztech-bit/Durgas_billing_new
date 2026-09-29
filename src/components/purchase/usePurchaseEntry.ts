import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PurchaseItem, Saree, Supplier } from '@/types';
import { API_URL } from '@/lib/config';

export function usePurchaseEntry(sarees: Saree[], suppliers: Supplier[]) {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [billNo, setBillNo] = useState('');
  const [purchaseType, setPurchaseType] = useState('gst');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Item Entry State
  const [barcode, setBarcode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [qty, setQty] = useState(1);
  const [costPrice, setCostPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  // Auto-fill on barcode match
  useEffect(() => {
    if (barcode) {
      const found = sarees.find((s) => s.barcode === barcode || s.sareeCode === barcode);
      if (found) {
        setItemName(found.name);
        setCategory(found.category);
        setCostPrice(found.purchasePrice);
        setMrp(found.mrp);
        setSellingPrice(found.sellingPrice);
      }
    }
  }, [barcode, sarees]);

  const handleAddItem = () => {
    if (!itemName || costPrice <= 0) {
      toast.error('Please enter valid product details');
      return;
    }

    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      barcode: barcode || `GEN-${Date.now().toString().slice(-6)}`,
      name: itemName,
      category,
      qty,
      costPrice,
      mrp,
      sellingPrice,
      totalCost: qty * costPrice,
    };

    setItems([...items, newItem]);
    resetEntryForm();
    toast.success('Item added to purchase list');
  };

  const resetEntryForm = () => {
    setBarcode('');
    setItemName('');
    setCategory('');
    setQty(1);
    setCostPrice(0);
    setMrp(0);
    setSellingPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const fetchHistory = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/purchases`);
      const data = await res.json();
      setPurchaseHistory(data);
    } catch (error) {
      toast.error('Failed to load purchase history');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSavePurchase = async () => {
    if (items.length === 0 || !supplier || !billNo) {
      toast.error('Please fill all bill details and add items');
      return;
    }

    const supplierObj = suppliers.find((s) => s.id === supplier);

    const newPurchase = {
      billNo,
      date: billDate,
      supplierId: supplier,
      supplierName: supplierObj?.name || 'Unknown',
      items,
      totalAmount: items.reduce((sum, item) => sum + (item.totalCost || 0), 0),
      paidAmount,
      paymentMethod,
      purchaseType: purchaseType as 'gst' | 'nongst',
    };

    try {
      const res = await fetch(`${API_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPurchase),
      });

      if (res.ok) {
        toast.success('Purchase entry saved successfully!');
        setItems([]);
        setSupplier('');
        setBillNo('');
        setPaidAmount(0);
        fetchHistory();
      } else {
        toast.error('Failed to save purchase');
      }
    } catch (error) {
      toast.error('Network error while saving');
    }
  };

  const handleUpdatePayment = async (purchaseId: string, amount: number, method: string) => {
    try {
      const res = await fetch(`${API_URL}/purchases/${purchaseId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      if (res.ok) {
        toast.success('Payment updated successfully');
        fetchHistory();
      } else {
        toast.error('Failed to update payment');
      }
    } catch (error) {
      toast.error('Error updating payment');
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  return {
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
  };
}
