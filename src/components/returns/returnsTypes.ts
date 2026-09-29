export interface BillItem {
  barcode: string;
  name: string;
  qty: number;
  returnedQty: number;
  sellingPrice: number;
  total: number;
}

export interface ReturnBill {
  id: string;
  billNo: string;
  customerName: string;
  customerMobile: string;
  items: BillItem[];
  grandTotal: number;
  date: string;
}

export interface ReturnCartItem extends BillItem {
  returnQty: number;
  condition: 'good' | 'damaged' | 'altered';
  isVerified: boolean;
  selected: boolean;
}
