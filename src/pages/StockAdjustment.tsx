import React, { useState } from 'react';
import {
    Plus,
    Minus,
    Search,
    CheckCircle,
    XCircle,
    AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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
import { AdjustmentItem } from '@/types';

// Using shared type instead of local interface

const StockAdjustment: React.FC = () => {
    const { sarees, addAdjustment } = useData();
    const [items, setItems] = useState<AdjustmentItem[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [selectedReason, setSelectedReason] = useState('damaged');
    const [adjustQty, setAdjustQty] = useState(1);

    const handleAddItem = () => {
        if (!barcodeInput) return;

        const product = sarees.find(s => s.barcode === barcodeInput || s.sareeCode === barcodeInput);

        const newItem: AdjustmentItem = {
            id: Math.random().toString(36).substr(2, 9),
            barcode: barcodeInput,
            name: product ? product.name : `Unknown Item (${barcodeInput})`,
            currentStock: product ? product.stockQty : 0,
            adjustQty: selectedReason === 'opening' || selectedReason === 'correction' ? adjustQty : -adjustQty, // Default negative for damaged/missing
            reason: selectedReason,
            date: new Date().toISOString(),
            status: 'pending'
        };

        setItems([...items, newItem]);
        setBarcodeInput('');
        toast.success('Item added to adjustment list');
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSubmit = () => {
        items.forEach(item => {
            addAdjustment(item);
        });
        toast.success('Stock adjustment submitted successfully');
        setItems([]);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Stock Adjustment</h1>
                <p className="text-muted-foreground">Correction for damaged, lost, or opening stock.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[400px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Adjustment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={selectedReason} onValueChange={setSelectedReason}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="damaged">Damaged / Defective</SelectItem>
                                        <SelectItem value="missing">Missing / Theft</SelectItem>
                                        <SelectItem value="correction">Correction</SelectItem>
                                        <SelectItem value="opening">Opening Stock Update</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Search</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Scan Barcode"
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button onClick={handleAddItem} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity Adjustment</label>
                                <Input
                                    type="number"
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Positive for finding/opening, Negative is calc automatically for damaged/missing</p>
                            </div>

                            <div className="rounded-lg bg-orange-50 p-4 border border-orange-100 text-sm text-orange-800 flex gap-2">
                                <AlertOctagon className="h-5 w-5 shrink-0" />
                                <p>Adjustments usually require Admin approval before reflecting in main inventory.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="h-full border-0 shadow-sm flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle>Adjustment List</CardTitle>
                                <Badge variant="secondary">{items.length} Items</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Current</TableHead>
                                        <TableHead className="text-center">Adjust (+/-)</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground">{item.barcode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {item.currentStock}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`font-bold ${item.adjustQty < 0 ? 'text-destructive' : 'text-success'}`}>
                                                        {item.adjustQty > 0 ? '+' : ''}{item.adjustQty}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{item.reason}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                No items added for adjustment.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {items.length > 0 && (
                            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setItems([])}>Cancel</Button>
                                <Button onClick={handleSubmit} className="bg-primary">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Submit for Approval
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;
