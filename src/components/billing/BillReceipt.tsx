import React, { forwardRef } from 'react';
import { Phone, MapPin, ShieldCheck, Award } from 'lucide-react';

export interface BillReceiptItem {
  id?: string;
  name: string;
  barcode?: string;
  qty: number;
  sellingPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  total?: number;
}

export interface BillReceiptProps {
  paperType: 'thermal' | 'a4';
  billNo?: string;
  customerName?: string;
  customerMobile?: string;
  customerPlace?: string;
  items: BillReceiptItem[];
  subTotal: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  roundOff?: number;
  grandTotal: number;
  date?: string;
  time?: string;
  paymentMethod?: string;
  billType?: string;
  settings?: {
    shopName?: string;
    shopNameTamil?: string;
    tagline?: string;
    slogan?: string;
    since?: string;
    address1?: string;
    address2?: string;
    addressTamil?: string;
    phone?: string;
    phoneLandline?: string;
    phoneMobile1?: string;
    phoneMobile2?: string;
    email?: string;
    gstNo?: string;
    gstin?: string;
    logoUrl?: string;
  };
}

export const BillReceipt = forwardRef<HTMLDivElement, BillReceiptProps>((props, ref) => {
  const {
    paperType,
    billNo = 'DRAFT',
    customerName,
    customerMobile,
    customerPlace,
    items = [],
    subTotal = 0,
    discountAmount = 0,
    taxAmount = 0,
    roundOff = 0,
    grandTotal = 0,
    date = new Date().toLocaleDateString('en-IN'),
    time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentMethod = 'CASH',
    billType = 'TAX INVOICE',
    settings,
  } = props;

  const shopNameTamil = settings?.shopNameTamil || 'துர்காஸ்';
  const shopName = settings?.shopName || 'DURGAS';
  const tagline = settings?.tagline || 'EXCLUSIVE GOLD & DIAMOND JEWELLERY';
  const slogan = settings?.slogan || 'மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES';
  const since = settings?.since || 'SINCE 2026';
  const addressTamil = settings?.addressTamil || 'நெ. 1A, திருக்கச்சநம்பி தெரு, (அண்ணா தியேட்டர் அருகில் - எதிர் தெருவில்), காஞ்சிபுரம் - 631 501.';
  const address = settings?.address1
    ? (settings.address2 ? `${settings.address1}, ${settings.address2}` : settings.address1)
    : 'No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street, Kanchipuram - 631 501';
  const phone = settings?.phone || '044 46621728, 89251 55521, 89251 55526';
  const email = settings?.email || 'durgaspos@gmail.com';
  const gstNo = settings?.gstNo || settings?.gstin || '33BWZPN2210D1ZO';

  // Total Quantity calculation
  const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div ref={ref} className="print-container flex justify-center w-full">
      {paperType === 'thermal' ? (
        /* -------------------------------------------------------------------------- */
        /* OPTIMIZED SINGLE THERMAL RECEIPT (80mm)                                    */
        /* -------------------------------------------------------------------------- */
        <div className="w-full flex justify-center p-1 sm:p-2">
          <div
            className="print-thermal-receipt bg-white p-3 shadow-md border border-gray-300 rounded-sm w-full max-w-[300px] font-mono text-[11px] text-black leading-tight select-none print:shadow-none print:border-none print:p-0 print:w-full print:m-0"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Store Brand Header */}
            <div className="text-center space-y-1 mb-2 border-b-2 border-dashed border-black pb-2">
              <h1 className="text-sm font-bold text-black break-words leading-tight">
                {shopNameTamil}
              </h1>
              <h2 className="text-base font-black uppercase tracking-wider text-black break-words leading-tight">
                {shopName}
              </h2>
              {tagline && (
                <p className="text-[9px] font-bold uppercase tracking-wider text-black">
                  {tagline}
                </p>
              )}
              {slogan && (
                <p className="text-[8.5px] text-gray-700 leading-tight">
                  {slogan}
                </p>
              )}
              
              <div className="text-center w-full font-bold uppercase py-0.5 border-y border-dashed border-black my-1 text-[10px]">
                {billType}
              </div>

              {/* Address */}
              <div className="text-[9px] text-gray-900 pt-0.5 space-y-0.5 leading-snug">
                <p className="break-words font-medium">{addressTamil}</p>
                <p className="text-[8.5px] text-gray-700 break-words">{address}</p>
              </div>
              <p className="text-[9.5px] font-bold tracking-tight text-black pt-0.5">
                Ph: {phone}
              </p>
              {email && (
                <p className="text-[8.5px] font-mono text-gray-700 break-all">
                  Email: {email}
                </p>
              )}
              {gstNo && (
                <p className="text-[10px] font-black text-black pt-0.5 tracking-wider">
                  GSTIN: {gstNo}
                </p>
              )}
            </div>

            {/* Bill Metadata Grid */}
            <div className="text-[10px] mb-2 pb-1.5 border-b border-dashed border-black space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="truncate mr-2">Bill No: <strong className="font-bold">{billNo}</strong></span>
                <span className="whitespace-nowrap">Mode: <strong className="font-bold uppercase">{paymentMethod}</strong></span>
              </div>
              <div className="flex justify-between items-center text-[9.5px]">
                <span>Date: {date}</span>
                <span>Time: {time}</span>
              </div>
            </div>

            {/* Customer Information (if present) */}
            {(customerName || customerMobile || customerPlace) && (
              <div className="mb-2 border-b border-dashed border-black pb-1.5 text-[10px] space-y-0.5">
                {customerName && <p className="break-words">Cust: <strong className="font-bold uppercase">{customerName}</strong></p>}
                {customerMobile && <p className="whitespace-nowrap font-mono">Mob : {customerMobile}</p>}
                {customerPlace && <p className="break-words">Loc : {customerPlace}</p>}
              </div>
            )}

            {/* Itemized Table */}
            <table className="w-full text-left mb-2 text-[10px]">
              <thead>
                <tr className="border-b-2 border-black font-bold uppercase text-[9px]">
                  <th className="py-1 w-[40%] text-left">Item</th>
                  <th className="py-1 w-[20%] text-right">Rate</th>
                  <th className="py-1 w-[15%] text-center">Qty</th>
                  <th className="py-1 w-[25%] text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => {
                  const itemBase = item.qty * item.sellingPrice;
                  const itemDisc = item.discountAmount ?? (itemBase * ((item.discountPercent || 0) / 100));
                  const itemTax = item.taxAmount ?? ((itemBase - itemDisc) * ((item.taxPercent || 0) / 100));
                  const itemNet = item.total ?? (itemBase - itemDisc + itemTax);

                  return (
                    <tr key={idx} className="print-break-inside-avoid">
                      <td className="py-1 text-left leading-snug break-words">
                        <span className="font-semibold">{item.name}</span>
                        {item.barcode && (
                          <span className="block text-[8px] text-gray-500 font-mono">[{item.barcode}]</span>
                        )}
                      </td>
                      <td className="py-1 text-right align-top tabular-nums">{item.sellingPrice}</td>
                      <td className="py-1 text-center align-top tabular-nums">{item.qty}</td>
                      <td className="py-1 text-right align-top font-bold tabular-nums whitespace-nowrap">{itemNet.toFixed(0)}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-center text-gray-500 italic">No items added</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary Breakdown */}
            <div className="border-t-2 border-dashed border-black pt-1.5 space-y-1 text-[10.5px] print-break-inside-avoid">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="tabular-nums font-mono font-medium">₹{subTotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-black">
                  <span>Discounts</span>
                  <span className="tabular-nums font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {taxAmount > 0 && (
                <div className="flex justify-between items-center text-black">
                  <span>GST Total</span>
                  <span className="tabular-nums font-mono">+₹{taxAmount.toFixed(2)}</span>
                </div>
              )}

              {roundOff !== 0 && (
                <div className="flex justify-between items-center text-black text-[9.5px]">
                  <span>Round-off</span>
                  <span className="tabular-nums font-mono">{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                </div>
              )}

              {/* NET GRAND TOTAL */}
              <div className="flex justify-between items-center font-extrabold text-sm pt-1 mt-1 border-t-2 border-b-2 border-black py-1 text-black uppercase">
                <span>NET TOTAL</span>
                <span className="tabular-nums font-mono text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-[9px] text-gray-700 pt-0.5">
                <span>Items: {items.length}</span>
                <span>Total Qty: {totalQty}</span>
              </div>
            </div>

            {/* Footer & Jewelry Policy */}
            <div className="mt-3 text-center text-[9px] space-y-0.5 border-t border-dashed border-black pt-2 print-break-inside-avoid">
              <p className="font-extrabold uppercase text-[10px]">Thank You! Visit Again</p>
              <p className="font-medium">916 Hallmark & Purity Guaranteed</p>
              <p className="text-[8.5px] text-gray-700">Exchange within 7 days with original invoice.</p>
              <p className="italic font-semibold text-[8.5px] pt-0.5">-- {shopName} --</p>
            </div>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------------------- */
        /* OPTIMIZED SINGLE A4 PROFESSIONAL TAX INVOICE FORMAT                        */
        /* -------------------------------------------------------------------------- */
        <div
          className="print-a4-invoice bg-white w-[794px] min-h-[1123px] p-8 border border-gray-300 rounded-lg shadow-xl text-gray-900 font-sans flex flex-col justify-between print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 print:min-h-0 select-none box-border shrink-0"
          style={{ width: '794px', minHeight: '1123px' }}
        >
          {/* TOP / BODY SECTION: Banner Header, Customer Info, Items Table */}
          <div className="flex-1 flex flex-col">
            {/* Top Banner Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-primary mb-4 gap-4">
              <div className="flex items-start gap-4 min-w-0 max-w-full sm:max-w-[72%] text-left">
                <img
                  src={settings?.logoUrl || '/logo.png'}
                  alt={shopName}
                  className="h-20 w-20 object-contain rounded-lg shrink-0 border border-amber-200/50 p-1 bg-white shadow-2xs"
                />
                <div className="space-y-1 min-w-0">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 leading-tight">
                      {shopNameTamil}
                    </h2>
                    <h1 className="font-display text-3xl font-black tracking-tight text-primary uppercase leading-tight">
                      {shopName}
                    </h1>
                    {tagline && (
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                        {tagline}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 space-y-0.5 pt-1">
                    <p className="text-sm leading-snug font-medium text-gray-900 break-words">
                      {addressTamil}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 break-words mt-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="break-words">{address}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-800 pt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <strong className="font-semibold">Ph:</strong> {phone}
                      </span>
                      {email && (
                        <span className="text-sm text-gray-600">
                          <strong className="font-semibold">Email:</strong> {email}
                        </span>
                      )}
                    </div>
                    {gstNo && (
                      <p className="text-sm font-bold text-gray-900 pt-1">
                        GSTIN: <span className="font-mono font-extrabold text-primary">{gstNo}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="inline-block bg-primary text-white font-extrabold px-4 py-1.5 rounded text-sm tracking-wider uppercase mb-2">
                  {billType}
                </div>
                <p className="text-sm font-bold text-gray-900">Invoice #: <span className="font-mono text-primary font-extrabold">{billNo}</span></p>
                <p className="text-xs text-gray-600">Date: <span className="font-medium text-gray-900">{date}</span></p>
                <p className="text-xs text-gray-600">Time: <span className="font-medium text-gray-900">{time}</span></p>
                <p className="text-xs text-gray-600">Payment: <span className="font-bold text-green-700 uppercase">{paymentMethod}</span></p>
              </div>
            </div>

            {/* Customer Billed To Section */}
            <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print-break-inside-avoid">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Billed To Customer</span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 capitalize mt-0.5 truncate">
                  {customerName || 'Walk-in Customer'}
                </h3>
                {customerPlace && <p className="text-xs text-gray-600 break-words">{customerPlace}</p>}
              </div>
              {customerMobile && (
                <div className="sm:text-right min-w-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contact Mobile</span>
                  <p className="text-sm font-bold text-gray-900 font-mono mt-0.5 whitespace-nowrap">{customerMobile}</p>
                </div>
              )}
            </div>

            {/* Itemized Invoice Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 mb-5">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-primary text-white uppercase text-[11px] tracking-wider font-semibold">
                    <th className="p-2.5 text-center w-[5%]">#</th>
                    <th className="p-2.5 text-left w-[14%] whitespace-nowrap">Rate (₹)</th>
                    <th className="p-2.5 w-[30%]">Item Description</th>
                    <th className="p-2.5 text-center w-[8%]">Qty</th>
                    <th className="p-2.5 text-right w-[9%] whitespace-nowrap">Disc %</th>
                    <th className="p-2.5 text-right w-[9%] whitespace-nowrap">GST %</th>
                    <th className="p-2.5 text-right w-[15%] whitespace-nowrap">Total (₹)</th>
                    <th className="p-2.5 text-right w-[10%]">Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const itemBase = item.qty * item.sellingPrice;
                    const itemDisc = item.discountAmount ?? (itemBase * ((item.discountPercent || 0) / 100));
                    const itemTax = item.taxAmount ?? ((itemBase - itemDisc) * ((item.taxPercent || 0) / 100));
                    const itemNet = item.total ?? (itemBase - itemDisc + itemTax);

                    return (
                      <tr key={index} className={`print-break-inside-avoid ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                        <td className="p-2.5 text-center text-xs font-mono text-gray-500">{index + 1}</td>
                        <td className="p-2.5 text-left font-mono text-gray-900 tabular-nums whitespace-nowrap">₹{item.sellingPrice.toFixed(2)}</td>
                        <td className="p-2.5 font-semibold text-gray-900 capitalize break-words">
                          {item.name}
                        </td>
                        <td className="p-2.5 text-center font-mono text-gray-900 tabular-nums">{item.qty}</td>
                        <td className="p-2.5 text-right font-mono text-gray-700 tabular-nums whitespace-nowrap">{item.discountPercent || 0}%</td>
                        <td className="p-2.5 text-right font-mono text-gray-700 tabular-nums whitespace-nowrap">{item.taxPercent || 0}%</td>
                        <td className="p-2.5 text-right font-mono font-bold text-primary tabular-nums whitespace-nowrap">₹{itemNet.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono text-gray-500 text-[10px] break-all">{item.barcode || '-'}</td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-400 italic">No items added to this invoice.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM SECTION: Pinned to bottom of the A4 sheet */}
          <div className="mt-auto pt-4 space-y-4">
            {/* Summary Totals & Terms Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start print-break-inside-avoid">
              {/* Terms & Conditions */}
              <div className="border border-gray-200 rounded-lg p-3 bg-slate-50/80 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase text-[10.5px] tracking-wider">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> Store Terms & Exchange Policy
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-gray-700">
                  <li>Gold purity & authenticity guaranteed with 916 Hallmark standards.</li>
                  <li>Goods once sold can only be exchanged within 7 days with original receipt.</li>
                  <li>No cash refunds will be provided under any circumstances.</li>
                  <li>Altered, broken, or customized ornaments are not eligible for standard exchange.</li>
                </ol>
              </div>

              {/* Totals Breakdown */}
              <div className="border border-gray-200 rounded-lg p-3.5 bg-white space-y-1.5 text-xs shadow-xs">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Subtotal ({items.length} items, {totalQty} qty)</span>
                  <span className="font-mono font-semibold text-gray-900 tabular-nums whitespace-nowrap">₹{subTotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>Total Item Discounts</span>
                    <span className="font-mono font-semibold tabular-nums whitespace-nowrap">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sky-800">
                      <span>CGST</span>
                      <span className="font-mono font-semibold tabular-nums whitespace-nowrap">₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sky-800">
                      <span>SGST</span>
                      <span className="font-mono font-semibold tabular-nums whitespace-nowrap">₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                  </>
                )}

                {roundOff !== 0 && (
                  <div className="flex justify-between items-center text-gray-600 text-[11px]">
                    <span>Round-off</span>
                    <span className="font-mono tabular-nums whitespace-nowrap">{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold text-sm sm:text-base pt-2 border-t-2 border-primary text-primary mt-1">
                  <span>NET GRAND TOTAL</span>
                  <span className="font-mono text-base sm:text-lg text-primary font-extrabold tabular-nums whitespace-nowrap">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-300 text-xs text-gray-600 print-break-inside-avoid gap-4">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">Thank you for shopping at {shopName}!</p>
                <p className="text-[10.5px] text-gray-500">Visit again for exclusive jewellery collections.</p>
              </div>

              <div className="text-center pt-6 border-t border-gray-400 w-40 sm:w-48 shrink-0">
                <p className="font-bold text-gray-900 text-[10px] uppercase whitespace-nowrap">Authorized Signatory</p>
                <p className="text-[9px] text-gray-500 truncate">{shopName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BillReceipt.displayName = 'BillReceipt';
