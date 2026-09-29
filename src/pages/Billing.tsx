import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { BillReceipt } from '@/components/billing/BillReceipt';
import { BillingCustomerForm } from '@/components/billing/BillingCustomerForm';
import { BillingItemInput } from '@/components/billing/BillingItemInput';
import { BillingItemsTable } from '@/components/billing/BillingItemsTable';
import { BillingSummaryCard } from '@/components/billing/BillingSummaryCard';
import { BillingPreviewCard } from '@/components/billing/BillingPreviewCard';
import { useBillingState } from '@/components/billing/useBillingState';
import { BillingHeader } from '@/components/billing/BillingHeader';

const Billing: React.FC = () => {
  const {
    customerName, setCustomerName,
    customerMobile, setCustomerMobile,
    customerPlace, setCustomerPlace,
    paymentMethod, setPaymentMethod,
    items, setItems,
    paperType, setPaperType,
    calculations,
    handleUpdateItem, handleRemoveItem, handleAddItem,
    handleClearForm, handleSaveBill, handleHoldBill,
    settings, sarees, itemTrie
  } = useBillingState();

  const invoiceRef = useRef<HTMLDivElement>(null);

  const getPageStyle = () => {
    if (paperType === 'thermal') {
      return `
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            -webkit-print-color-adjust: exact;
          }
          .print-thermal-receipt {
            margin: 0 !important;
            width: 76mm !important;
            max-width: 76mm !important;
          }
        }
      `;
    }
    return `
      @page { size: A4 portrait; margin: 5mm; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
        }
      }
    `;
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Durgas_Bill_${Date.now()}`,
    pageStyle: getPageStyle(),
    onAfterPrint: () => toast.success('Print job completed'),
  });

  return (
    <div className="space-y-6">
      <BillingHeader
        itemCount={items.length}
        paperType={paperType}
        onPaperTypeChange={setPaperType}
        onClearForm={handleClearForm}
        onHoldBill={handleHoldBill}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <BillingCustomerForm
            customerName={customerName}
            customerMobile={customerMobile}
            customerPlace={customerPlace}
            onCustomerNameChange={setCustomerName}
            onCustomerMobileChange={setCustomerMobile}
            onCustomerPlaceChange={setCustomerPlace}
          />

          <BillingItemInput
            itemTrie={itemTrie}
            sarees={sarees}
            defaultTaxRate={settings?.taxRate || 5}
            onAddItem={handleAddItem}
          />

          <BillingItemsTable
            items={calculations.items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <BillingSummaryCard
            itemCount={items.length}
            totalQty={items.reduce((s, i) => s + i.qty, 0)}
            subTotal={calculations.subTotal}
            totalDiscountAmount={calculations.totalDiscountAmount}
            totalTaxAmount={calculations.totalTaxAmount}
            roundOff={calculations.roundOff}
            grandTotal={calculations.grandTotal}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onSaveBill={(print) => handleSaveBill(print, handlePrint)}
            disabled={items.length === 0}
          />

          <BillingPreviewCard
            paperType={paperType}
            items={calculations.items}
            customerName={customerName}
            customerMobile={customerMobile}
            customerPlace={customerPlace}
            subTotal={calculations.subTotal}
            totalDiscountAmount={calculations.totalDiscountAmount}
            totalTaxAmount={calculations.totalTaxAmount}
            roundOff={calculations.roundOff}
            grandTotal={calculations.grandTotal}
            paymentMethod={paymentMethod}
            settings={settings}
            onPrint={handlePrint}
          />
        </div>
      </div>

      {/* Off-screen container for react-to-print */}
      <div style={{ position: 'absolute', left: '-99999px', top: '-99999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
        <BillReceipt
          ref={invoiceRef}
          paperType={paperType}
          billNo="PREVIEW"
          customerName={customerName}
          customerMobile={customerMobile}
          customerPlace={customerPlace}
          items={calculations.items}
          subTotal={calculations.subTotal}
          discountAmount={calculations.totalDiscountAmount}
          taxAmount={calculations.totalTaxAmount}
          roundOff={calculations.roundOff}
          grandTotal={calculations.grandTotal}
          paymentMethod={paymentMethod}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default Billing;
