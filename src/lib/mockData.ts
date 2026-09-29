import { Saree, Supplier, Staff } from '@/types';
import { Bill } from '@/types/bill';

export const initialSettings = {
  shopName: 'DURGAS',
  shopNameTamil: 'துர்காஸ்',
  tagline: 'EXCLUSIVE GOLD & DIAMOND JEWELLERY',
  slogan: 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES',
  since: 'SINCE 2026',
  address1: 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street',
  address2: 'Kanchipuram - 631 501',
  addressTamil: 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.',
  phone: '044 46621728, 89251 55521, 89251 55526',
  phoneLandline: '044 46621728',
  phoneMobile1: '89251 55521',
  phoneMobile2: '89251 55526',
  email: 'durgaspos@gmail.com',
  gstNo: '33BWZPN2210D1ZO',
  gstin: '33BWZPN2210D1ZO',
  logoUrl: './logo.png',
  currency: 'INR',
  taxRate: 0,
};

export const initialSarees: Saree[] = [];

export const initialCustomers: any[] = [];

export const initialBills: Bill[] = [];

export const initialExpenses: any[] = [];

export const initialStaff: Staff[] = [];

export const initialSuppliers: Supplier[] = [];
