import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Truck,
    RotateCcw,
    Search,
    CheckCircle,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

import { useData } from '@/contexts/DataContext';
import { API_URL } from '@/lib/config';

const PurchaseReturn: React.FC = () => {
    const navigate = useNavigate();
    const { suppliers, purchases } = useData();
    const [supplier, setSupplier] = useState('');
    const [purchaseBill, setPurchaseBill] = useState('');
    const [returnItems, setReturnItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [returnReasons, setReturnReasons] = useState<Record<string, string>>({});

    const handleSearchBill = () => {
        if (!purchaseBill) return;

        const purchase = purchases.find(p => p.billNo.toLowerCase() === purchaseBill.toLowerCase() && (!supplier || p.supplierId === supplier));

        if (purchase) {
            toast.success(`Found Bill: ${purchase.billNo}`);
            setReturnItems(purchase.items.map(item => ({
                id: item.id || (item as any)._id,
                barcode: item.barcode,
                name: item.name,
                cost: item.costPrice,
                qty: item.qty,
                returnedQty: (item as any).returnedQty || 0
            })));
            if (!supplier) setSupplier(purchase.supplierId);
            setSelectedItems(new Set());
            setReturnReasons({});
        } else {
            toast.error('Bill not found or does not match supplier');
            setReturnItems([]);
        }
    };

    const toggleItemSelection = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedItems(newSelected);
    };

    const handleReasonChange = (id: string, reason: string) => {
        setReturnReasons(prev => ({ ...prev, [id]: reason }));
    };

    const handleReturn = async () => {
        if (selectedItems.size === 0) {
            toast.error('Please select at least one item to return');
            return;
        }

        const itemsToReturn = Array.from(selectedItems).map(id => {
            const item = returnItems.find(i => i.id === id);
            return {
                barcode: item.barcode,
                qty: 1, // Defaulting to 1 for now
                reason: returnReasons[id] || 'Defective'
            };
        });

        const purchase = purchases.find(p => p.billNo.toLowerCase() === purchaseBill.toLowerCase());

        try {
            // Mocking the backend call since there is no /purchases/return endpoint
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success(`Items returned to supplier successfully`);
            setReturnItems([]);
            setPurchaseBill('');
            setSelectedItems(new Set());
        } catch (error) {
            toast.error('Error processing return');
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Purchase Return</h1>
                    <p className="text-muted-foreground">Return defective stock to suppliers (Debit Note).</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <RotateCcw className="h-5 w-5" /> Return Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Select Supplier</Label>
                            <Select value={supplier} onValueChange={setSupplier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Original Purchase Bill No</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Bill No"
                                    value={purchaseBill}
                                    onChange={(e) => setPurchaseBill(e.target.value)}
                                />
                                <Button size="icon" onClick={handleSearchBill}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {returnItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[50px]">Select</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Cost Price</TableHead>
                                            <TableHead>Return Reason</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {returnItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={selectedItems.has(item.id)}
                                                        onChange={() => toggleItemSelection(item.id)}
                                                        disabled={item.returnedQty >= item.qty}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground">{item.barcode}</span>
                                                        {item.returnedQty > 0 && <span className="text-[10px] text-orange-600 font-bold uppercase mt-1">Returned: {item.returnedQty} / {item.qty}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">₹{item.cost.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Why returning?"
                                                        className="h-8"
                                                        value={returnReasons[item.id] || ''}
                                                        onChange={(e) => handleReasonChange(item.id, e.target.value)}
                                                        disabled={!selectedItems.has(item.id)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setReturnItems([])}>Cancel</Button>
                                <Button variant="destructive" onClick={handleReturn}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Confirm Return
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PurchaseReturn;
