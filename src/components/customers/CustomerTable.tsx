import React from 'react';
import {
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  Wallet,
  Download,
  Edit,
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
import { Customer } from '@/types';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onSendOffer: (mobile: string) => void;
  onPayment: (name: string) => void;
  onDownloadLedger: (name: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onSendOffer,
  onPayment,
  onDownloadLedger,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-foreground">Customer</TableHead>
            <TableHead className="font-bold text-foreground">Contact & City</TableHead>
            <TableHead className="font-bold text-foreground">Type</TableHead>
            <TableHead className="font-bold text-foreground text-right">Total Purchases</TableHead>
            <TableHead className="font-bold text-foreground text-center">Visits</TableHead>
            <TableHead className="font-bold text-foreground text-right">Outstanding Dues</TableHead>
            <TableHead className="w-[60px] text-right font-bold text-foreground"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <p className="font-medium text-sm">No matching customers found.</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search criteria.</p>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
                      <AvatarFallback className="font-bold text-primary text-xs">
                        {c.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1 font-mono text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{c.mobile}</span>
                    </div>
                    {c.place && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{c.place}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-normal">
                    {c.type || 'Retail'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                  ₹{(c.totalPurchases || 0).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    {c.visitCount || 1}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {c.pendingDue && c.pendingDue > 0 ? (
                    <span className="font-mono font-bold text-sm text-destructive">
                      ₹{c.pendingDue.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 text-xs">
                      Clear
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
                        Customer Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(c)} className="gap-2">
                        <Edit className="h-4 w-4 text-primary" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendOffer(c.mobile)} className="gap-2 text-emerald-600">
                        <MessageSquare className="h-4 w-4" />
                        Send WhatsApp Offer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPayment(c.name)} className="gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        Settle Dues
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDownloadLedger(c.name)} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Ledger
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
