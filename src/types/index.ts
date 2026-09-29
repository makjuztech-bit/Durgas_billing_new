export interface Saree {
    id: string;
    sareeCode: string;
    barcode: string;
    name: string;
    nameTamil: string;
    category: string;
    department?: 'Jewelry' | 'Mens' | 'Kids' | 'Womens' | 'Other';
    brand: string;
    material: string;
    zariType: string;
    borderType: string;
    color: string;
    designType: string;
    length: string;
    weight: string;
    blouseIncluded: boolean;
    blousePiece: string;
    purchasePrice: number;
    sellingPrice: number;
    mrp: number;
    gstPercent: number;
    stockType: 'unique' | 'bulk';
    stockQty: number;
    rackLocation: string;
    supplier: string;
    images: string[];
    description: string;
    status: 'available' | 'sold' | 'reserved' | 'damaged';
    addedDate: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    mobile: string;
    gstin: string;
    location: string;
    pendingDue: number;
}

export interface AdjustmentItem {
    id: string;
    barcode: string;
    name: string;
    currentStock: number;
    adjustQty: number;
    reason: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface PurchaseItem {
    id: string;
    barcode: string;
    name: string;
    category: string;
    qty: number;
    costPrice: number;
    mrp: number;
    sellingPrice: number;
    totalCost: number;
}

export interface Purchase {
    id: string;
    billNo: string;
    date: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    totalAmount: number;
    paidAmount: number;
    dueAmount?: number;
    paymentStatus: 'Paid' | 'Partial' | 'Credit';
    status: 'completed' | 'pending';
    purchaseType: 'gst' | 'nongst';
}

export interface AlterationJob {
    id: string;
    customer: string;
    mobile: string;
    items: string; // concise description
    services: string[]; // e.g. Fall, Pico, Blouse
    status: 'Pending' | 'In Progress' | 'Ready' | 'Delivered';
    deliveryDate: string;
    amount: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerMobile: string;
    description: string;
    deliveryDate: string;
    totalEstimated: number;
    advancePaid: number;
    status: 'Booked' | 'Ready' | 'Delivered' | 'Cancelled';
    orderDate: string;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    commissionType: 'Percentage' | 'Fixed';
    commissionValue: number;
    active: boolean;
    salesThisMonth: number;
}

export interface Customer {
    id: string;
    name: string;
    mobile: string;
    place?: string;
    type?: string;
    email?: string;
    totalPurchase?: number;
    totalPurchases?: number;
    billsCount?: number;
    visitCount?: number;
    pendingDue?: number;
    lastPurchase?: string;
    createdDate?: string;
}

export interface StoreSettings {
    id?: string;
    shopName: string;
    shopNameTamil?: string;
    tagline: string;
    slogan?: string;
    since?: string;
    address1: string;
    address2?: string;
    addressTamil?: string;
    phone: string;
    phoneLandline?: string;
    phoneMobile1?: string;
    phoneMobile2?: string;
    email?: string;
    gstNo?: string;
    gstin?: string;
    logoUrl?: string;
    currency?: string;
    taxRate?: number;
    receiptFooter?: string;
    terms?: string;
    primaryColor?: string;
    backgroundPattern?: string;
    visibleWidgets?: {
        todaySales?: boolean;
        pendingDues?: boolean;
        fastMoving?: boolean;
        lowStock?: boolean;
    };
    footerMessage?: string;
    termsConditions?: string;
}

export * from './bill';

