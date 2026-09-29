# Durgas POS - Professional Billing Software Design Document
## Overview
This document outlines the architectural and user interface design for "Durgas POS", a specialized billing software customized for showrooms in Tamil Nadu. The system is designed to be customizable, robust, and user-friendly, supporting bilingual operations (Tamil/English).

## Core Configurations
- **Deployment**: Single Branch / Multi-Branch
- **Printing**: Thermal 80mm / A4 Laser
- **Taxation**: GST Enabled / Disabled (Toggleable)
- **Inventory**: Unique 1-piece tracking (Silk Sarees) / Bulk Stock (Cotton/Synthetic)
- **Language**: English / Tamil / Hybrid (Bilingual Invoices)
- **Hardware**: Barcode Scanner, Barcode Tag Printer, Thermal/Laser Printers
- **Integrations**: WhatsApp Invoice Sending

## User Roles
1. **Admin**: Full Access
2. **Manager**: Management + Reports (Restricted Settings)
3. **Cashier**: Billing + Returns + Payments
4. **Salesman**: Sales assistance + Dashboard (Commissions)
5. **Stock Manager**: Inventory + Purchase + Damages

---

# Page-Wise detailed Design

## 1. First Time Setup Wizard (Admin Configuration)
**Purpose**: Initialize the application with business specific details.
**UI Layout**: Stepper (Company -> Settings -> Branch -> Rules).
**Fields**:
- **Company**: Name, Logo Upload, Address, Phone, Email, GSTIN (if applicable).
- **Billing Config**:
  - Type: Retail / Wholesale / Both.
  - Invoice Prefix (e.g., "SILK-").
  - Bill Series Start (e.g., 001).
- **Hardware**:
  - Default Printer: Thermal 80mm / A4.
  - Print Language: English / Tamil / Both.
- **Branch**:
  - Mode: Single Branch / Multi-Branch (If Multi, add Main Branch Name).
- **Rules**:
  - Default Return Validity (e.g., 7 Days).
  - Default Service Charges (Fall/Pico rates).
**Buttons**: Next, Previous, Finish Setup.
**Customization**: All fields editable later in Settings.

## 2. Login Page
**Purpose**: Secure entry point for staff.
**UI Layout**: Centered Card on Silk-themed background.
**Fields**:
- Username / Mobile Number.
- Password.
- Branch Selector (Dropdown - active only if Multi-Branch enabled).
- "Forgot Password?" Link.
- Login with OTP (Alternative).
**Buttons**: Login, Request OTP.
**Validation**: Credential check, Role-based redirection.

## 3. Dashboard (Home)
**Purpose**: At-a-glance business health monitor.
**UI Components**:
- **Key Metrics (Cards)**:
  - Today's Sales (₹).
  - Bill Count.
  - Returns (₹).
  - Payment Split (Cash vs UPI vs Card).
  - Profit Estimate (Admin Only).
- **Stock Alerts**: Low stock marquee or list, Dead stock warning.
- **Graphs**:
  - Sales Trend (Line: Today/Week).
  - Category Share (Pie: Silk vs Cotton vs Fancy).
- **Quick Links**: New Bill, Purchase Entry, Add Stock, Returns, Reports.
**Customization**: Admin can drag-and-drop widgets, hide Profit widget for non-Admins.

## 4. Billing Page (The Core)
**Purpose**: Fast, efficient checkout process.
**UI Layout**: 3-Column Layout (Customer | Product Items | Summary/Payment).
**Sections**:
- **A) Customer Panel (Top Left)**:
  - Search (Phone/Name) with Auto-complete.
  - Fields: Name, Mobile, Location, Type (Retail/Wholesale/VIP), GST No (if B2B).
  - "Add New Customer" modal trigger.
- **B) Product Entry (Top Center)**:
  - Scan Barcode (Focus by default).
  - Type Code/Name (Search).
  - "Select Manual" (for non-barcoded misc items).
- **C) Bill Item Table (Center)**:
  - Columns: #, Code, Item Name, Design/Color, MRP, Rate, Disc %, Qty, Total.
  - Rows allow inline editing of Discount/Rate (with permission).
- **D) Extra Services (Bottom Left/Center)**:
  - Toggles/Inputs: Fall/Pico (Checkbox), Blouse Stitching (Checkbox + measurements modal), Gift Packing.
- **E) Bill Summary (Right Sidebar)**:
  - Subtotal.
  - Overall Discount.
  - Tax (CGST+SGST breakdown if GST enabled).
  - Round Off (Auto).
  - **Grand Total (Large Font)**.
- **F) Payment (Bottom Right)**:
  - Modes: Cash, Card, UPI, Credit (Due), Partial/Split.
  - "Tendered Amount" & "Change to Return" display.
**Buttons**: Save (F2), Print (F4), WhatsApp Send, Hold (F6), Clear.
**Translation**: "Saree" -> "புடவை" (if Tamil enabled).

## 5. Bill History + Reprint
**Purpose**: View and manage past transactions.
**Layout**: List with filters on top, Preview pane on right.
**Table Columns**: Bill No, Date, Customer, Amount, Status, Payment Mode, Salesman.
**Filters**: Date Range, Bill No, Mobile, Payment Type.
**Actions**:
- View Detail.
- Reprint (Thermal/A4).
- Send WhatsApp (Resend).
- Cancel Bill (Reason required, Admin Auth).
- Download PDF.

## 6. Hold Bill Page
**Purpose**: manage suspended transactions.
**UI**: Card Grid or List of held bills.
**Info**: Customer Name, Items Count, Held Time, Hold Reason.
**Actions**: Resume (Loads to Billing), Delete.

## 7. Customer Management
**Purpose**: CRM and Credit Management.
**Layout**: List/Grid of customers.
**Fields**: Name, Mobile, Type, Place, GSTIN.
**Metrics**: Total Spent, Visit Count, Pending Due.
**Actions**: View History, Payment Collection (for Dues), Ledger Export, WhatsApp Offer.

## 8. Saree Master (Product Master)
**Purpose**: Define product catalogue.
**UI Layout**: Tabs (Basic Info | Pricing | Attributes | Images).
**Fields**:
- **Basic**: Name, Category (Kanjeevaram/Soft Silk/Cotton), Barcode (Auto/Manual), HSN Code.
- **Attributes**: Weaver/Brand, Material, Zari Type, Border Type, Color, Design.
- **Stock**: Type (Unique Piece - qty is always 1 per barcode / Bulk), Location (Rack/Shelf).
- **Pricing**: Purchase Price, MRP, Selling Price, GST % (0/5/12).
- **Images**: Front View, Pallu/Close-up.
**Buttons**: Save, Save & Print Barcode, Clone Product.

## 9. Inventory / Stock List
**Purpose**: View current stock status.
**Layout**: Advanced Data Grid.
**Columns**: Barcode, Name, Category, Rack, Cost, Price, Status (Available/Sold/Damaged/Held).
**Filters**: Category, Price Range, Location, Status, Weaver.
**Actions**: Quick Edit (Price), Transfer Branch, Mark Damaged, Print Tag.

## 10. Stock Adjustment
**Purpose**: Correct inventory discrepancies.
**UI**: Form with Item Table.
**Types**: Damaged, Missing (Theft), Opening Stock.
**Fields**: Barcode/Item, Adjustment Qty (+/-), Reason.
**Admin Approval**: Required for high value adjustments.

## 11. Purchase Entry (Inward)
**Purpose**: Record incoming stock from weavers/suppliers.
**UI**: Header (Supplier Info) + Body (Item Grid).
**Header**: Supplier Name, Bill No, Bill Date, Purchase Type (GST/Non-GST).
**Grid**: Barcode (Auto-generate), Category, Description, Qty, Cost Rate, MRP, Selling Price.
**Actions**: Save Purchase, Generate Barcodes (Batch).

## 12. Supplier Management
**Purpose**: Vendor database and accounts.
**UI**: List with Side Detail Panel.
**Fields**: Business Name, Contact Person, Mobile, GSTIN, Address, Bank Details.
**Ledger**: Purchase History, Payments Made, Balance Due.
**Actions**: Pay Supplier, Download Ledger.

## 13. Purchase Return
**Purpose**: Send bad stock back to supplier.
**Flow**: Select Supplier -> Select Purchase Bill -> Select Items to Return.
**Effect**: Reduces Stock, Debits Supplier Ledger.

## 14. Return / Exchange (Customer)
**Purpose**: Handle customer product returns.
**Policy Logic**:
- "Condition" Check: Good (Resellable) / Damaged / Altered.
- If "Altered" (Fall/Pico done) -> Warn/Deduct cost.
- If "Exchange" -> Credit amount to new bill.
- If "Refund" -> Output Mode (Cash/UPI).
**Workflow**: Input Bill # -> Select Item -> Calculate Deduction -> Finalize Credit Note/Refund.

## 15. Alteration Service
**Purpose**: Track tailoring status.
**Fields**: Bill No Ref, Customer, Services (Fall, Pico, Blouse Stitching, Aari), Measurements.
**Timeline**: In Queue -> In Progress -> Ready -> Delivered.
**Actions**: Print Service Slip (Tag), WhatsApp Status Update.

## 16. Order Booking (Advance)
**Purpose**: Pre-booking expensive sarees or wedding bulk orders.
**Fields**: Customer, Items (if selected) or Generic Description, Total Estimated, Advance Paid, delivery Date.
**Status**: Booked, Ready, Delivered, Cancelled.
**Actions**: Convert to Final Bill (adjusts advance).

## 17. Due / Credit Management
**Purpose**: Track customer debts.
**UI**: Aging Report / List of Defaulters.
**Columns**: Customer, Mobile, Bill Ref, Due Amount, Due Days.
**Actions**: "Collect Payment" (Partial allowed), Send WhatsApp Reminder.

## 18. Expenses
**Purpose**: Petty cash and operational cost tracking.
**Types**: Rent, EB, Chai/Coffee, Salary, Transport, Marketing.
**Fields**: Category, Amount, Date, Paid By, Notes, Receipt Image.

## 19. Staff & Commission
**Purpose**: Employee management.
**Fields**: Name, Role, Login Access (Yes/No), PIN/Password.
**Commission Config**: % of Sales, Fixed per Saree, or Category-based (e.g., Higher comm for Old Stock).
**Reports**: Leaderboard.

## 20. Reports Center
**Purpose**: Business Intelligence.
**Categories**:
- **Sales**: Daily, Monthly, Yearly, Bill-wise.
- **Stock**: Stock Valuation, Slow Moving, Fast Moving.
- **Staff**: Performance, Commissions.
- **Financial**: Profit/Loss (Approx), Expense Report, Tax Report.
**Export**: PDF, Excel.

## 21. GST Reports
**Purpose**: Statutory compliance.
**Reports**: GSTR-1 Format (B2B, B2C Large, B2C Small), HSN Summary.
**Formats**: JSON (for portal), Excel (for auditor).

## 22. Notification / WhatsApp
**Purpose**: Communication Hub.
**Features**:
- Templates for Invoice, Birthday, Anniversary, Offers.
- Auto-triggers: "Bill Saved" -> "Send PDF".
- Bulk Sender (for marketing).

## 23. Settings (Admin)
**Tabs**:
- **General**: Shop Name, Address, Logo.
- **Formats**: Invoice layout choices, Terms & Conditions text.
- **Hardware**: Printer setup, Barcode format (e.g., 12 digits EAN).
- **Modules**: Enable/Disable "Alterations", "Order Booking".
- **Backup**: Schedule local/cloud backups.

## 24. User Roles & Permissions
**UI**: Matrix Checkbox (Roles vs Permissions).
**Items**: "View Cost Price", "Edit Discount", "Delete Bill", "View Reports", "Backdate Entry".

## 25. Backup & Restore
**Purpose**: Data safety.
**Actions**: "Create Backup Now", "Restore from File".

## 26. Admin Customization Center
**Purpose**: The "God Mode" for the software.
**Capabilities**:
- **Theme**: Select Colors (e.g., Maroon/Gold for Silk shop), Font Size.
- **UI density**: Compact / Comfortable.
- **Invoice Design**: Drag and drop fields for the print layout.
- **Field Toggle**: Hide "Hsn Code" if not needed.
- **Audit Logs**: View who did what (security trail).

---
## Global Top Header (After Login)
**Left**: Logo & Shop Name.
**Right**:
- User Profile (Name + Role).
- Branch Indicator (if multi-branch).
- Notification Bell.
- **Language Switch**: [ EN | தமிழ் ] Toggles entire UI strings instantly.
