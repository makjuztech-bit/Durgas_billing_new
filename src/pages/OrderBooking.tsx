import React from 'react';
import {
    CalendarDays,
    User,
    ShoppingBag,
    CreditCard,
    Plus,
    Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { Order } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

const OrderBooking: React.FC = () => {
    const { orders, addOrder } = useData();
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [description, setDescription] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [estimated, setEstimated] = useState(0);
    const [advance, setAdvance] = useState(0);

    const handleSave = () => {
        if (!customerMobile || !customerName || !description) {
            toast.error('Please fill required details');
            return;
        }

        const newOrder: Order = {
            id: `ORD-${Date.now().toString().slice(-4)}`,
            customerName,
            customerMobile,
            description,
            deliveryDate,
            totalEstimated: estimated,
            advancePaid: advance,
            status: 'Booked',
            orderDate: new Date().toISOString().split('T')[0]
        };

        addOrder(newOrder);
        toast.success('Order Booking Saved Successfully');

        // Reset
        setCustomerMobile('');
        setCustomerName('');
        setDescription('');
        setDeliveryDate('');
        setEstimated(0);
        setAdvance(0);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Pre-Order / Booking</h1>
                <p className="text-muted-foreground">Book orders for weddings and bulk purchases with advance payment.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Booking Form */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" /> Order Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer Mobile</Label>
                                <Input
                                    placeholder="9988776655"
                                    value={customerMobile}
                                    onChange={e => setCustomerMobile(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Name</Label>
                                <Input
                                    placeholder="Name"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Items / Requirement Description</Label>
                            <Textarea
                                placeholder="e.g. 50x Gold Coins for Wedding return gift. Specific packaging required."
                                className="min-h-[100px]"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Delivery Date</Label>
                                <Input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Estimated (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={estimated}
                                    onChange={e => setEstimated(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Advance Paid (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="border-green-300 bg-green-50"
                                    value={advance}
                                    onChange={e => setAdvance(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <Button size="lg" className="w-full md:w-auto" onClick={handleSave}>
                            <Check className="mr-2 h-5 w-5" /> Confirm Booking
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <div className="space-y-4">
                    <Card className="h-full border-0 shadow-sm flex flex-col">
                        <CardHeader className="border-b pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle>Recent Orders</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.customerName}</div>
                                                <div className="text-xs text-muted-foreground">{order.description.slice(0, 20)}...</div>
                                            </TableCell>
                                            <TableCell>{order.deliveryDate}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={order.status === 'Booked' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {orders.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No recent bookings</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderBooking;
