import React, { useState } from 'react';
import {
    Users,
    Shield,
    Percent,
    UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useData } from '@/contexts/DataContext';
import { Staff } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Removed mock data as it is now in Context

const StaffManagement: React.FC = () => {
    const { staffList, addStaff } = useData();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Add Form State
    const [name, setName] = useState('');
    const [role, setRole] = useState('Salesman');
    const [commissionType, setCommissionType] = useState<'Percentage' | 'Fixed'>('Percentage');
    const [commissionValue, setCommissionValue] = useState(0);

    const handleSave = () => {
        if (!name) {
            toast.error('Please enter employee name');
            return;
        }

        const newStaff: Staff = {
            id: `EMP-${Date.now()}`,
            name,
            role,
            commissionType,
            commissionValue,
            active: true,
            salesThisMonth: 0
        };
        addStaff(newStaff);
        setIsAddOpen(false);
        toast.success(`Employee ${name} added successfully`);
        // Reset
        setName('');
        setCommissionValue(0);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Staff & Commissions</h1>
                    <p className="text-muted-foreground">Manage employees, roles and sales incentives.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Salesman">Salesman</SelectItem>
                                        <SelectItem value="Cashier">Cashier</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Commission Type</Label>
                                <Select value={commissionType} onValueChange={(v: 'Percentage' | 'Fixed') => setCommissionType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="Fixed">Fixed Amount / Item</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Commission Value</Label>
                                <Input
                                    type="number"
                                    value={commissionValue}
                                    onChange={e => setCommissionValue(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save Employee</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffList.filter(s => s.role === 'Salesman').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Commissions Est. (This Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            ₹{staffList.reduce((sum, s) => sum + (s.commissionType === 'Percentage' ? (s.salesThisMonth * s.commissionValue / 100) : 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>Manage access and commission rates.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Commission Structure</TableHead>
                                <TableHead className="text-right">Sales (Month)</TableHead>
                                <TableHead className="text-right">Est. Commission</TableHead>
                                <TableHead className="text-center">Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffList.map((staff) => (
                                <TableRow key={staff.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{staff.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{staff.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                            {staff.commissionValue > 0 ? (
                                                <span>
                                                    {staff.commissionValue}
                                                    {staff.commissionType === 'Percentage' ? '%' : ' per item'}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">None</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">₹{staff.salesThisMonth.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        ₹{Math.floor(staff.commissionType === 'Percentage' ? (staff.salesThisMonth * staff.commissionValue / 100) : 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch checked={staff.active} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffManagement;
