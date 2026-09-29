import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import { Customer } from '@/types';

export function useCustomerService() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile: '',
    place: '',
    type: 'Retail',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        localStorage.setItem('durgas_customers', JSON.stringify(data));
        return;
      }
    } catch (error) {
      console.log('Loading customers in standalone mode');
    }
    const saved = localStorage.getItem('durgas_customers');
    setCustomers(saved ? JSON.parse(saved) : []);
  };

  const handleSaveCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) {
      toast.error('Name and Mobile are required');
      return;
    }

    try {
      const url = editingId ? `${API_URL}/customers/${editingId}` : `${API_URL}/customers`;
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
    } catch (error) {
      console.log('Saving customer in standalone mode');
    }

    setCustomers((prev) => {
      let updated;
      if (editingId) {
        updated = prev.map((c) => (c.id === editingId ? { ...c, ...newCustomer } : c));
      } else {
        const item = {
          ...newCustomer,
          id: `CUST-${Date.now().toString().slice(-4)}`,
          totalPurchases: 0,
          visitCount: 1,
          createdDate: new Date().toISOString().split('T')[0],
        };
        updated = [...prev, item];
      }
      localStorage.setItem('durgas_customers', JSON.stringify(updated));
      return updated;
    });

    toast.success(`Customer ${editingId ? 'updated' : 'added'} successfully`);
    setIsAddOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCustomer({ name: '', mobile: '', place: '', type: 'Retail' });
    setEditingId(null);
  };

  const handleEdit = (customer: Customer) => {
    setNewCustomer({
      name: customer.name,
      mobile: customer.mobile,
      place: customer.place || '',
      type: customer.type || 'Retail',
    });
    setEditingId(customer.id);
    setIsAddOpen(true);
  };

  return {
    customers,
    newCustomer,
    setNewCustomer,
    editingId,
    isAddOpen,
    setIsAddOpen,
    handleSaveCustomer,
    resetForm,
    handleEdit,
  };
}
