import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Saree, Supplier, AdjustmentItem, Purchase, AlterationJob, Order, Staff, Bill, StoreSettings } from '@/types';
import { api } from '@/lib/api';
import { Trie } from '@/lib/trie';

interface DataContextType {
    sarees: Saree[];
    suppliers: Supplier[];
    adjustments: AdjustmentItem[];
    purchases: Purchase[];
    addSaree: (saree: Saree) => Promise<Saree>;
    updateSaree: (id: string, updates: Partial<Saree>) => Promise<Saree | null>;
    deleteSaree: (id: string) => Promise<void>;
    addSupplier: (supplier: Supplier) => Promise<void>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    addAdjustment: (adjustment: AdjustmentItem) => Promise<void>;
    adjustStock: (productId: string, adjustQty: number, reason?: string, referenceNo?: string) => Promise<Saree | undefined>;
    addPurchase: (purchase: Purchase) => Promise<void>;
    alterations: AlterationJob[];
    addAlteration: (job: AlterationJob) => Promise<void>;
    updateAlteration: (id: string, updates: Partial<AlterationJob>) => Promise<void>;
    orders: Order[];
    addOrder: (order: Order) => Promise<void>;
    staffList: Staff[];
    addStaff: (staff: Staff) => Promise<void>;
    bills: Bill[];
    addBill: (bill: Bill) => Promise<Bill>;
    updateBill: (id: string, updates: Partial<Bill>) => Promise<Bill | void>;
    deleteBill: (id: string) => Promise<void>;
    clearAllBills: () => Promise<void>;
    settings: StoreSettings;
    updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
    itemTrie: Trie;
    isLoading: boolean;
    refreshAll: () => Promise<void>;
    refreshProducts: () => Promise<void>;
    refreshBills: () => Promise<void>;
}

const defaultSettings: StoreSettings = {
    shopName: 'DURGAS',
    shopNameTamil: 'துர்காஸ்',
    tagline: 'EXCLUSIVE GOLD & DIAMOND JEWELLERY',
    slogan: 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES',
    since: 'SINCE 2026',
    address1: 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street',
    address2: 'Kanchipuram - 631 501',
    addressTamil: 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.',
    phone: '044 46621728, 89251 55521, 89251 55526',
    phoneLandline: '044 46621728',
    phoneMobile1: '89251 55521',
    phoneMobile2: '89251 55526',
    email: 'durgaspos@gmail.com',
    gstNo: '33BWZPN2210D1ZO',
    gstin: '33BWZPN2210D1ZO',
    logoUrl: '/durgas-logo.jpeg',
    currency: 'INR',
    taxRate: 5,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sarees, setSarees] = useState<Saree[]>(() => {
        try {
            const saved = localStorage.getItem('durgas_sarees');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
        try {
            const saved = localStorage.getItem('durgas_suppliers');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [alterations, setAlterations] = useState<AlterationJob[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [staffList, setStaffList] = useState<Staff[]>(() => {
        try {
            const saved = localStorage.getItem('durgas_staff');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [bills, setBills] = useState<Bill[]>(() => {
        try {
            const saved = localStorage.getItem('durgas_bills');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [settings, setSettings] = useState<StoreSettings>(() => {
        try {
            const saved = localStorage.getItem('durgas_settings');
            return saved ? JSON.parse(saved) : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const itemTrie = useMemo(() => new Trie(), []);

    // Synchronize Trie indexes whenever products or bills update
    useEffect(() => {
        bills.forEach((bill: Bill) => {
            bill.items?.forEach(item => {
                if (item.name) {
                    itemTrie.insert(item.name, item.sellingPrice || 0);
                }
            });
        });
        sarees.forEach((saree: Saree) => {
            if (saree.name) {
                itemTrie.insert(saree.name, saree.sellingPrice || saree.mrp || 0);
            }
        });
    }, [bills, sarees, itemTrie]);

    // Fetch all entities from SQLite backend
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedSarees, fetchedBills, fetchedSuppliers, fetchedStaff, fetchedSettings, fetchedAdjustments] = await Promise.allSettled([
                api.get<Saree[]>('/sarees'),
                api.get<Bill[]>('/bills'),
                api.get<Supplier[]>('/suppliers'),
                api.get<Staff[]>('/staff'),
                api.get<StoreSettings>('/settings'),
                api.get<AdjustmentItem[]>('/adjustments'),
            ]);

            if (fetchedSarees.status === 'fulfilled' && Array.isArray(fetchedSarees.value)) {
                setSarees(fetchedSarees.value);
                localStorage.setItem('durgas_sarees', JSON.stringify(fetchedSarees.value));
            }
            if (fetchedBills.status === 'fulfilled' && Array.isArray(fetchedBills.value)) {
                setBills(fetchedBills.value);
                localStorage.setItem('durgas_bills', JSON.stringify(fetchedBills.value));
            }
            if (fetchedSuppliers.status === 'fulfilled' && Array.isArray(fetchedSuppliers.value)) {
                setSuppliers(fetchedSuppliers.value);
                localStorage.setItem('durgas_suppliers', JSON.stringify(fetchedSuppliers.value));
            }
            if (fetchedStaff.status === 'fulfilled' && Array.isArray(fetchedStaff.value)) {
                setStaffList(fetchedStaff.value);
                localStorage.setItem('durgas_staff', JSON.stringify(fetchedStaff.value));
            }
            if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value) {
                setSettings({ ...defaultSettings, ...fetchedSettings.value });
                localStorage.setItem('durgas_settings', JSON.stringify(fetchedSettings.value));
            }
            if (fetchedAdjustments.status === 'fulfilled' && Array.isArray(fetchedAdjustments.value)) {
                setAdjustments(fetchedAdjustments.value);
            }
        } catch (error) {
            console.warn('Backend sync in offline cached mode:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshProducts = useCallback(async () => {
        try {
            const data = await api.get<Saree[]>('/sarees');
            if (Array.isArray(data)) {
                setSarees(data);
                localStorage.setItem('durgas_sarees', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Error refreshing products:', err);
        }
    }, []);

    const refreshBills = useCallback(async () => {
        try {
            const data = await api.get<Bill[]>('/bills');
            if (Array.isArray(data)) {
                setBills(data);
                localStorage.setItem('durgas_bills', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Error refreshing bills:', err);
        }
    }, []);

    const addSaree = async (saree: Saree): Promise<Saree> => {
        try {
            const newSaree = await api.post<Saree>('/sarees', saree);
            if (newSaree && newSaree.id) {
                setSarees(prev => {
                    const updated = [...prev, newSaree];
                    localStorage.setItem('durgas_sarees', JSON.stringify(updated));
                    return updated;
                });
                toast.success(`Product "${newSaree.name}" added successfully!`);
                return newSaree;
            }
        } catch (error) {
            console.warn('Adding saree in local fallback mode');
        }

        const fallbackSaree: Saree = {
            ...saree,
            id: saree.id || `SAR-${Date.now().toString().slice(-4)}`,
        };
        setSarees(prev => {
            const updated = [...prev, fallbackSaree];
            localStorage.setItem('durgas_sarees', JSON.stringify(updated));
            return updated;
        });
        toast.success(`Product "${fallbackSaree.name}" added!`);
        return fallbackSaree;
    };

    const updateSaree = async (id: string, updates: Partial<Saree>): Promise<Saree | null> => {
        try {
            const updated = await api.patch<Saree>(`/sarees/${id}`, updates);
            if (updated && updated.id) {
                setSarees(prev => {
                    const list = prev.map(s => (s.id === id ? updated : s));
                    localStorage.setItem('durgas_sarees', JSON.stringify(list));
                    return list;
                });
                toast.success('Product updated!');
                return updated;
            }
        } catch (error) {
            console.warn('Updating saree in local fallback mode');
        }

        let updatedSaree: Saree | null = null;
        setSarees(prev => {
            const list = prev.map(s => {
                if (s.id === id) {
                    updatedSaree = { ...s, ...updates };
                    return updatedSaree;
                }
                return s;
            });
            localStorage.setItem('durgas_sarees', JSON.stringify(list));
            return list;
        });
        toast.success('Product updated!');
        return updatedSaree;
    };

    const deleteSaree = async (id: string): Promise<void> => {
        try {
            await api.delete(`/sarees/${id}`);
        } catch (error) {
            console.warn('Deleting saree in local fallback mode');
        }
        setSarees(prev => {
            const list = prev.filter(saree => saree.id !== id);
            localStorage.setItem('durgas_sarees', JSON.stringify(list));
            return list;
        });
        toast.success('Product removed!');
    };

    const addSupplier = async (supplier: Supplier): Promise<void> => {
        try {
            const newSupplier = await api.post<Supplier>('/suppliers', supplier);
            if (newSupplier) {
                setSuppliers(prev => [...prev, newSupplier]);
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
        }
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<void> => {
        try {
            const updated = await api.patch<Supplier>(`/suppliers/${id}`, updates);
            if (updated) {
                setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
        }
    };

    const deleteSupplier = async (id: string): Promise<void> => {
        try {
            await api.delete(`/suppliers/${id}`);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const addAdjustment = async (adjustment: AdjustmentItem): Promise<void> => {
        try {
            const newAdj = await api.post<AdjustmentItem>('/adjustments', adjustment);
            if (newAdj) {
                setAdjustments(prev => [...prev, newAdj]);
                await refreshProducts();
            }
        } catch (error) {
            console.error('Error adding adjustment:', error);
        }
    };

    const adjustStock = async (productId: string, adjustQty: number, reason?: string, referenceNo?: string): Promise<Saree | undefined> => {
        try {
            const data = await api.post<{ product: Saree; adjustment: AdjustmentItem }>(`/products/${productId}/adjust-stock`, {
                adjustQty,
                reason,
                referenceNo,
            });
            if (data?.product) {
                setSarees(prev => {
                    const updated = prev.map(s => (s.id === data.product.id ? data.product : s));
                    localStorage.setItem('durgas_sarees', JSON.stringify(updated));
                    return updated;
                });
                if (data.adjustment) {
                    setAdjustments(prev => [data.adjustment, ...prev]);
                }
                toast.success(`Stock updated: ${data.product.name} (Current: ${data.product.stockQty})`);
                return data.product;
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const addPurchase = async (purchase: Purchase): Promise<void> => {
        try {
            const newPurchase = await api.post<Purchase>('/purchases', purchase);
            if (newPurchase) {
                setPurchases(prev => [...prev, newPurchase]);
                await refreshProducts();
            }
        } catch (error) {
            console.error('Error adding purchase:', error);
        }
    };

    const addAlteration = async (job: AlterationJob): Promise<void> => {
        try {
            const newJob = await api.post<AlterationJob>('/alterations', job);
            if (newJob) {
                setAlterations(prev => [...prev, newJob]);
            }
        } catch (error) {
            console.error('Error adding alteration:', error);
        }
    };

    const updateAlteration = async (id: string, updates: Partial<AlterationJob>): Promise<void> => {
        try {
            const updated = await api.patch<AlterationJob>(`/alterations/${id}`, updates);
            if (updated) {
                setAlterations(prev => prev.map(a => (a.id === id ? updated : a)));
            }
        } catch (error) {
            console.error('Error updating alteration:', error);
        }
    };

    const addOrder = async (order: Order): Promise<void> => {
        try {
            const newOrder = await api.post<Order>('/orders', order);
            if (newOrder) {
                setOrders(prev => [...prev, newOrder]);
            }
        } catch (error) {
            console.error('Error adding order:', error);
        }
    };

    const addStaff = async (staff: Staff): Promise<void> => {
        try {
            const newStaff = await api.post<Staff>('/staff', staff);
            if (newStaff) {
                setStaffList(prev => [...prev, newStaff]);
            }
        } catch (error) {
            console.error('Error adding staff:', error);
        }
    };

    const addBill = async (bill: Bill): Promise<Bill> => {
        try {
            const newBill = await api.post<Bill>('/bills', bill);
            if (newBill && newBill.id) {
                setBills(prev => {
                    const updated = [newBill, ...prev];
                    localStorage.setItem('durgas_bills', JSON.stringify(updated));
                    return updated;
                });
                newBill.items?.forEach(item => {
                    if (item.name) {
                        itemTrie.insert(item.name, item.sellingPrice || item.mrp || 0);
                    }
                });
                await refreshProducts();
                return newBill;
            }
        } catch (error) {
            console.warn('Saving bill in local fallback mode:', error);
        }

        const fallbackBill: Bill = {
            ...bill,
            id: bill.id || `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, '0')}`,
            billNo: bill.billNo || `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, '0')}`,
            createdDate: bill.createdDate || new Date().toISOString(),
        };
        setBills(prev => {
            const updated = [fallbackBill, ...prev];
            localStorage.setItem('durgas_bills', JSON.stringify(updated));
            return updated;
        });
        fallbackBill.items?.forEach(item => {
            if (item.name) {
                itemTrie.insert(item.name, item.sellingPrice || item.mrp || 0);
            }
        });
        toast.success(`Bill ${fallbackBill.billNo} saved successfully!`);
        return fallbackBill;
    };

    const updateBill = async (id: string, updates: Partial<Bill>): Promise<Bill | void> => {
        try {
            await api.patch(`/bills/${id}/status`, updates).catch(() => {});
        } catch (error) {
            console.warn('Updating bill in local fallback mode:', error);
        }
        setBills(prev => {
            const updated = prev.map(b => (b.id === id || b.billNo === id ? { ...b, ...updates } : b));
            localStorage.setItem('durgas_bills', JSON.stringify(updated));
            return updated;
        });
        toast.success('Bill updated successfully');
    };

    const deleteBill = async (id: string): Promise<void> => {
        try {
            await api.delete(`/bills/${id}`);
            await refreshProducts();
        } catch (error) {
            console.warn('Deleting bill in local fallback mode:', error);
        }
        setBills(prev => {
            const updated = prev.filter(b => b.id !== id && b.billNo !== id);
            localStorage.setItem('durgas_bills', JSON.stringify(updated));
            return updated;
        });
        toast.success('Bill deleted successfully');
    };

    const clearAllBills = async (): Promise<void> => {
        try {
            await api.delete('/bills');
            await refreshProducts();
        } catch (error) {
            console.warn('Clearing bills in local fallback mode:', error);
        }
        setBills([]);
        localStorage.removeItem('durgas_bills');
        toast.success('All bills cleared successfully');
    };

    const updateSettings = async (updates: Partial<StoreSettings>): Promise<void> => {
        try {
            const updated = await api.patch<StoreSettings>('/settings', updates);
            if (updated) {
                setSettings(prev => ({ ...prev, ...updated }));
                localStorage.setItem('durgas_settings', JSON.stringify(updated));
                toast.success('Settings updated successfully');
                return;
            }
        } catch (error) {
            console.warn('Updating settings in local fallback mode:', error);
        }
        setSettings(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('durgas_settings', JSON.stringify(updated));
            return updated;
        });
        toast.success('Settings updated successfully');
    };

    return (
        <DataContext.Provider
            value={{
                sarees,
                suppliers,
                adjustments,
                purchases,
                alterations,
                orders,
                staffList,
                bills,
                addSaree,
                updateSaree,
                deleteSaree,
                addSupplier,
                updateSupplier,
                deleteSupplier,
                addAdjustment,
                adjustStock,
                addPurchase,
                addAlteration,
                updateAlteration,
                addOrder,
                addStaff,
                addBill,
                updateBill,
                deleteBill,
                clearAllBills,
                settings,
                updateSettings,
                itemTrie,
                isLoading,
                refreshAll: fetchData,
                refreshProducts,
                refreshBills,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
