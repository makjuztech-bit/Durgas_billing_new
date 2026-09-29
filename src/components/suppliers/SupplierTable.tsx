import React from 'react';
import {
  Building2,
  Phone,
  MapPin,
  FileText,
  Wallet,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Supplier } from '@/types';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onHistory: (supplier: Supplier) => void;
  onRecordPayment: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onEdit,
  onHistory,
  onRecordPayment,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-foreground">Supplier Name</TableHead>
            <TableHead className="font-bold text-foreground">Contact Details</TableHead>
            <TableHead className="font-bold text-foreground">Location</TableHead>
            <TableHead className="font-bold text-foreground text-right">Pending Payable</TableHead>
            <TableHead className="w-[60px] text-right font-bold text-foreground"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="font-medium text-sm">No suppliers registered yet.</p>
                <p className="text-xs text-muted-foreground">Add your first supplier above.</p>
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
                      <AvatarFallback className="font-bold text-primary text-xs">
                        {supplier.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{supplier.name}</p>
                      {supplier.gstin && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          GSTIN: {supplier.gstin}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-medium text-foreground">{supplier.contactPerson || '-'}</p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{supplier.mobile || '-'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{supplier.location || 'Not Specified'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {supplier.pendingDue > 0 ? (
                    <span className="font-mono font-bold text-sm text-destructive">
                      ₹{supplier.pendingDue.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 text-xs">
                      Settled
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(supplier)} className="gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onHistory(supplier)} className="gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        View Purchase History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRecordPayment(supplier)} className="gap-2 text-emerald-600 focus:text-emerald-700">
                        <Wallet className="h-4 w-4" />
                        Record Payment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2"
                        onClick={() => onDelete(supplier.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        Delete Supplier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
