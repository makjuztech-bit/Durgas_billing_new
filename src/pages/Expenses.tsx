import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import { ExpenseFormCard } from '@/components/expenses/ExpenseFormCard';
import { ExpenseTable, ExpenseItem } from '@/components/expenses/ExpenseTable';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [type, setType] = useState('Tea/Coffee');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        localStorage.setItem('durgas_expenses', JSON.stringify(data));
        return;
      }
    } catch (error) {
      console.log('Loading expenses in standalone mode');
    }
    const saved = localStorage.getItem('durgas_expenses');
    setExpenses(saved ? JSON.parse(saved) : []);
  };

  const handleAdd = async () => {
    if (!amount) return;

    try {
      await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: Number(amount), date, note }),
      });
    } catch (error) {
      console.log('Saving expense in standalone mode');
    }

    const newExp: ExpenseItem = {
      _id: `EXP-${Date.now().toString().slice(-4)}`,
      id: `EXP-${Date.now().toString().slice(-4)}`,
      type,
      amount: Number(amount),
      date,
      note,
    };

    setExpenses((prev) => {
      const updated = [newExp, ...prev];
      localStorage.setItem('durgas_expenses', JSON.stringify(updated));
      return updated;
    });

    setAmount('');
    setNote('');
    toast.success('Expense recorded successfully');
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.log('Deleting expense in standalone mode');
    }

    setExpenses((prev) => {
      const updated = prev.filter((e) => (e._id || e.id) !== id);
      localStorage.setItem('durgas_expenses', JSON.stringify(updated));
      return updated;
    });
    toast.success('Expense deleted');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.reduce((s, e) => {
    const expenseDate = new Date(e.date).toISOString().split('T')[0];
    return s + (expenseDate === todayStr ? e.amount : 0);
  }, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Expense Tracker</h1>
        <p className="text-muted-foreground">Log and monitor shop operational and miscellaneous expenditures.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[350px_1fr]">
        {/* Entry Form Card */}
        <ExpenseFormCard
          type={type}
          setType={setType}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          note={note}
          setNote={setNote}
          onAdd={handleAdd}
        />

        {/* List & Metrics Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase font-semibold text-muted-foreground">Today's Expenses</p>
                <p className="text-2xl font-bold font-mono text-primary mt-1">
                  ₹{todayExpenses.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/70 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase font-semibold text-muted-foreground">Lifetime Total</p>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <ExpenseTable expenses={expenses} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Expenses;
