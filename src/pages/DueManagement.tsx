import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    Wallet,
    Search,
    MessageSquare,
    Phone,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface DueRecord {
    id: string;
    customer: string;
    mobile: string;
    billRef: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
}

const DueManagement: React.FC = () => {
    const navigate = useNavigate();
    const { bills, updateBill } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter bills with dues
    const dues: DueRecord[] = bills
        .filter(bill => bill.status === 'Due' || (bill.dueAmount && bill.dueAmount > 0))
        .map(bill => {
            const billDate = new Date(bill.date);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - billDate.getTime());
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: bill.id,
                customer: bill.customerName || 'Unknown',
                mobile: bill.customerMobile || '',
                billRef: bill.billNo,
                amount: bill.dueAmount || bill.grandTotal,
                dueDate: bill.date,
                daysOverdue: daysOverdue
            };
        });

    const filteredDues = dues.filter(d => 
        d.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.mobile.includes(searchTerm) || 
        d.billRef.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalOutstanding = filteredDues.reduce((sum, d) => sum + (d.amount || 0), 0);

    const handleCollect = async (id: string, amount: number) => {
        try {
            await updateBill(id, {
                status: 'Paid',
                dueAmount: 0
            });
            toast.success(`Successfully collected payment of ₹${amount}`);
        } catch (error) {
            toast.error('Failed to collect payment');
            console.error(error);
        }
    };

    const handleReminder = (mobile: string, amount: number) => {
        const text = `Dear Customer, this is a reminder regarding your pending due of ₹${amount}. Please arrange for payment at the earliest. Thank you - Durgas Billing`;
        window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(text)}`, '_blank');
        toast.success(`WhatsApp opened for ${mobile}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Due Management</h1>
                    <p className="text-muted-foreground">Track and collect customer credits.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/billing')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Bill
                    </Button>
                    <Card className="bg-destructive text-destructive-foreground border-none">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Wallet className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Total Outstanding</p>
                                <p className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Pending Collections</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search Customer..." 
                                className="pl-9 h-9" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Customer</TableHead>
                                <TableHead>Bill Ref</TableHead>
                                <TableHead className="text-right">Due Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDues.map((due) => (
                                <TableRow key={due.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{due.customer}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {due.mobile}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{due.billRef}</TableCell>
                                    <TableCell className="text-right font-bold text-destructive">₹{due.amount.toLocaleString()}</TableCell>
                                    <TableCell>{due.dueDate}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                                            {due.daysOverdue} Days Overdue
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleReminder(due.mobile, due.amount)}>
                                                <MessageSquare className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button size="sm" onClick={() => handleCollect(due.id, due.amount)}>
                                                Collect
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredDues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No pending dues found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default DueManagement;
