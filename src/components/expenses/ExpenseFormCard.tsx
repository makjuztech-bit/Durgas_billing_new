import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseFormCardProps {
  type: string;
  setType: (type: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  date: string;
  setDate: (date: string) => void;
  note: string;
  setNote: (note: string) => void;
  onAdd: () => void;
}

export const ExpenseFormCard: React.FC<ExpenseFormCardProps> = ({
  type,
  setType,
  amount,
  setAmount,
  date,
  setDate,
  note,
  setNote,
  onAdd,
}) => {
  return (
    <Card className="h-fit border border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold font-display">
          <Plus className="h-5 w-5 text-primary" /> New Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <Label className="text-xs">Expense Category</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Electricity">Electricity</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Packaging">Packaging</SelectItem>
              <SelectItem value="Tea/Coffee">Tea & Snacks</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Amount (₹) *</Label>
          <Input
            type="number"
            placeholder="0.00"
            className="h-9 text-xs font-bold"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            className="h-9 text-xs"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Notes / Details</Label>
          <Textarea
            placeholder="Description..."
            className="text-xs"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button className="w-full bg-primary shadow-sm" onClick={onAdd}>
          Save Expense
        </Button>
      </CardContent>
    </Card>
  );
};
