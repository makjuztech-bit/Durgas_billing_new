export interface BillItem {
    sareeId?: string;
    barcode: string;
    name: string;
    qty: number;
    sellingPrice: number;
    mrp?: number;
    total: number;
}

export interface Bill {
    id: string;
    billNo: string;
    customerName: string;
    customerMobile: string;
    customerPlace?: string;
    customerType?: string;
    customerGst?: string;
    items: BillItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent?: number;
    taxAmount?: number;
    gstAmount?: number;
    roundOff?: number;
    grandTotal: number;
    paymentMethod: string;
    status: 'Paid' | 'Hold' | 'Due' | 'Cancelled';
    dueAmount: number;
    date: string;
    createdDate?: string;
}
