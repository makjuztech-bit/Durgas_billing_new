import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ta: 'முகப்பு' },
  'nav.billing': { en: 'New Bill', ta: 'புதிய பில்' },
  'nav.billHistory': { en: 'Bill History', ta: 'பில் வரலாறு' },
  'nav.holdBills': { en: 'Hold Bills', ta: 'நிறுத்தப்பட்ட பில்' },
  'nav.customers': { en: 'Customers', ta: 'வாடிக்கையாளர்கள்' },
  'nav.products': { en: 'Jewelry Master', ta: 'நகை மாஸ்டர்' },
  'nav.inventory': { en: 'Inventory', ta: 'கையிருப்பு' },
  'nav.stockAdjust': { en: 'Stock Adjustment', ta: 'கையிருப்பு சரிசெய்' },
  'nav.purchase': { en: 'Purchase Entry', ta: 'வாங்கல் பதிவு' },

  'nav.suppliers': { en: 'Suppliers', ta: 'சப்ளையர்கள்' },
  'nav.purchaseReturn': { en: 'Purchase Return', ta: 'வாங்கல் திரும்ப' },
  'nav.returns': { en: 'Returns/Exchange', ta: 'திரும்ப/மாற்று' },
  'nav.alterations': { en: 'Alterations', ta: 'மாற்றங்கள்' },
  'nav.orders': { en: 'Order Booking', ta: 'ஆர்டர் புக்கிங்' },
  'nav.dues': { en: 'Due/Credit', ta: 'கடன்' },
  'nav.expenses': { en: 'Expenses', ta: 'செலவுகள்' },
  'nav.staff': { en: 'Staff & Commission', ta: 'ஊழியர்கள்' },
  'nav.reports': { en: 'Reports', ta: 'அறிக்கைகள்' },
  'nav.gstReports': { en: 'GST Reports', ta: 'GST அறிக்கைகள்' },
  'nav.whatsapp': { en: 'WhatsApp', ta: 'WhatsApp' },
  'nav.settings': { en: 'Settings', ta: 'அமைப்புகள்' },
  'nav.users': { en: 'Users & Roles', ta: 'பயனர்கள்' },
  'nav.backup': { en: 'Backup', ta: 'காப்புப்பிரதி' },
  'nav.migration': { en: 'Smart Migration', ta: 'டேட்டா மைக்ரேஷன்' },
  'nav.customize': { en: 'Customization', ta: 'தனிப்பயனாக்கம்' },
  'nav.barcode': { en: 'Barcode Generator', ta: 'பார்கோடு ஜெனரேட்டர்' },

  // Common
  'common.search': { en: 'Search', ta: 'தேடு' },
  'common.save': { en: 'Save', ta: 'சேமி' },
  'common.cancel': { en: 'Cancel', ta: 'ரத்து' },
  'common.delete': { en: 'Delete', ta: 'நீக்கு' },
  'common.edit': { en: 'Edit', ta: 'திருத்து' },
  'common.add': { en: 'Add', ta: 'சேர்' },
  'common.print': { en: 'Print', ta: 'அச்சு' },
  'common.export': { en: 'Export', ta: 'ஏற்றுமதி' },
  'common.total': { en: 'Total', ta: 'மொத்தம்' },
  'common.amount': { en: 'Amount', ta: 'தொகை' },
  'common.date': { en: 'Date', ta: 'தேதி' },
  'common.status': { en: 'Status', ta: 'நிலை' },
  'common.actions': { en: 'Actions', ta: 'செயல்கள்' },
  'common.welcome': { en: 'Welcome', ta: 'வணக்கம்' },
  'common.logout': { en: 'Logout', ta: 'வெளியேறு' },

  // Dashboard
  'dashboard.todaySales': { en: "Today's Sales", ta: 'இன்றைய விற்பனை' },
  'dashboard.todayBills': { en: "Today's Bills", ta: 'இன்றைய பில்கள்' },
  'dashboard.cashSales': { en: 'Cash Sales', ta: 'ரொக்க விற்பனை' },
  'dashboard.upiSales': { en: 'UPI Sales', ta: 'UPI விற்பனை' },
  'dashboard.cardSales': { en: 'Card Sales', ta: 'கார்டு விற்பனை' },
  'dashboard.creditPending': { en: 'Credit Pending', ta: 'கடன் நிலுவை' },
  'dashboard.returns': { en: 'Returns', ta: 'திரும்பல்கள்' },
  'dashboard.profit': { en: 'Approx Profit', ta: 'தோராய லாபம்' },
  'dashboard.stockValue': { en: 'Stock Value', ta: 'கையிருப்பு மதிப்பு' },
  'dashboard.lowStock': { en: 'Low Stock Alert', ta: 'குறைந்த கையிருப்பு' },
  'dashboard.bestSelling': { en: 'Best Selling', ta: 'அதிகம் விற்பனை' },

  // Billing
  'billing.newBill': { en: 'New Bill', ta: 'புதிய பில்' },
  'billing.customer': { en: 'Customer', ta: 'வாடிக்கையாளர்' },
  'billing.mobile': { en: 'Mobile', ta: 'மொபைல்' },
  'billing.scanBarcode': { en: 'Scan Barcode', ta: 'பார்கோடு ஸ்கேன்' },
  'billing.addSaree': { en: 'Add Jewelry Item', ta: 'நகை பொருள் சேர்' },
  'billing.subtotal': { en: 'Subtotal', ta: 'உப மொத்தம்' },
  'billing.discount': { en: 'Discount', ta: 'தள்ளுபடி' },
  'billing.gst': { en: 'GST', ta: 'GST' },
  'billing.grandTotal': { en: 'Grand Total', ta: 'மொத்த தொகை' },
  'billing.payment': { en: 'Payment', ta: 'பணம்' },
  'billing.cash': { en: 'Cash', ta: 'ரொக்கம்' },
  'billing.savePrint': { en: 'Save & Print', ta: 'சேமி & அச்சு' },
  'billing.holdBill': { en: 'Hold Bill', ta: 'பில் நிறுத்து' },
  'billing.whatsapp': { en: 'WhatsApp Invoice', ta: 'WhatsApp பில்' },

  // Login
  'login.title': { en: 'Sign In', ta: 'உள்நுழை' },
  'login.username': { en: 'Username', ta: 'பயனர்பெயர்' },
  'login.password': { en: 'Password', ta: 'கடவுச்சொல்' },
  'login.branch': { en: 'Select Branch', ta: 'கிளை தேர்வு' },
  'login.forgot': { en: 'Forgot Password?', ta: 'கடவுச்சொல் மறந்தது?' },
  'login.otp': { en: 'Login with OTP', ta: 'OTP உள்நுழைவு' },

  // Setup
  'setup.welcome': { en: 'Welcome to Durgas', ta: 'துர்காஸ் உங்களை வரவேற்கிறது' },
  'setup.companyInfo': { en: 'Company Information', ta: 'நிறுவன தகவல்' },
  'setup.gstSettings': { en: 'GST Settings', ta: 'GST அமைப்புகள்' },
  'setup.billingSettings': { en: 'Billing Settings', ta: 'பில்லிங் அமைப்புகள்' },
  'setup.branchSetup': { en: 'Branch Setup', ta: 'கிளை அமைப்பு' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
