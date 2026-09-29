export interface HsnItem {
    code?: string;
    hsnCode?: string;
    description: string;
    taxable?: number;
    taxableValue?: number;
    tax?: number;
    taxAmount?: number;
    rate?: number;
    totalQty?: number;
}

export interface GstData {
    totalTaxable: number;
    totalTax: number;
    b2bCount: number;
    hsnSummary: HsnItem[];
}
