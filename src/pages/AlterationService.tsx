import React, { useState } from 'react';
import {
    Scissors,
    Ruler,
    Calendar,
    User,
    Phone,
    CheckCircle2,
    Clock,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AlterationJob } from '@/types';

const AlterationService: React.FC = () => {
    const { alterations, addAlteration, updateAlteration } = useData();

    // Form State
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [itemsDesc, setItemsDesc] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [amount, setAmount] = useState(0);

    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const handleCreateJob = () => {
        if (!customerMobile || !itemsDesc || selectedServices.length === 0) {
            toast.error('Please fill all required details');
            return;
        }

        const newJob: AlterationJob = {
            id: `JOB-${Date.now().toString().slice(-4)}`,
            customer: customerName || 'Walk-in',
            mobile: customerMobile,
            items: itemsDesc,
            services: selectedServices,
            status: 'Pending',
            deliveryDate: deliveryDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            amount: amount || 0
        };

        addAlteration(newJob);
        toast.success(`Job Ticket ${newJob.id} Created`);

        // Reset Form
        setCustomerMobile('');
        setCustomerName('');
        setItemsDesc('');
        setSelectedServices([]);
        setDeliveryDate('');
        setAmount(0);
    };

    const handleStatusChange = (id: string) => {
        const job = alterations.find(j => j.id === id);
        if (!job) return;

        const nextStatus: Record<string, AlterationJob['status']> = {
            'Pending': 'In Progress',
            'In Progress': 'Ready',
            'Ready': 'Delivered',
            'Delivered': 'Delivered'
        };

        const newStatus = nextStatus[job.status];
        if (newStatus && newStatus !== job.status) {
            updateAlteration(id, { status: newStatus });
            toast.success(`Job status updated to ${newStatus}`);
        }
    };

    const handlePrint = (id: string) => {
        toast.info('Printing Service Slip...');
        // Print logic
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Alterations & Tailoring</h1>
                <p className="text-muted-foreground">Manage fall, pico, embroidery and stitching services.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                {/* New Job Form */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="h-5 w-5" /> New Job Entry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Customer Mobile</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search or Enter Mobile"
                                        className="pl-9"
                                        value={customerMobile}
                                        onChange={e => setCustomerMobile(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Name</Label>
                                <Input
                                    placeholder="Name"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Jewelry / Item Details</Label>
                                <Input
                                    placeholder="e.g. 22K Gold Chain"
                                    value={itemsDesc}
                                    onChange={e => setItemsDesc(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label>Services Required</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Resizing', 'Polishing', 'Stone Setting', 'Repair'].map((service) => (
                                        <div key={service} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={service}
                                                checked={selectedServices.includes(service)}
                                                onCheckedChange={() => handleServiceToggle(service)}
                                            />
                                            <label htmlFor={service} className="text-sm font-medium">{service}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Est. Delivery</Label>
                                    <Input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={e => setDeliveryDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Charges (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-2" onClick={handleCreateJob}>Create Job Ticket</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Job List */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm h-full flex flex-col">
                        <CardHeader className="border-b pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle>Active Jobs</CardTitle>
                                <Badge variant="secondary">{alterations.length} Active</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Delivery</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alterations.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-mono text-xs">{job.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{job.customer}</span>
                                                    <span className="text-xs text-muted-foreground">{job.mobile}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {job.services.map(s => (
                                                        <Badge key={s} variant="outline" className="text-[10px] bg-muted/50">{s}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{job.deliveryDate}</TableCell>
                                            <TableCell>
                                                <Badge className={`
                                                    ${job.status === 'Ready' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                                    ${job.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                                                `}>
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handlePrint(job.id)}>
                                                        <Printer className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleStatusChange(job.id)}>
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AlterationService;
