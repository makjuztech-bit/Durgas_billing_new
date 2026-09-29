import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Branch } from '@/components/setup/StepBranchSetup';

export function useSetupWizardState() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Company Info
  const [companyName, setCompanyName] = useState('DURGAS');
  const [companyAddress, setCompanyAddress] = useState('No. 1A, Thirukatchi Nambi Street, Near Anna Theatre - Opposite Street, Kanchipuram - 631 501');
  const [companyPhone, setCompanyPhone] = useState('044 46621728, 89251 55521, 89251 55526');
  const [companyEmail, setCompanyEmail] = useState('durgaspos@gmail.com');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // GST Settings
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstNumber, setGstNumber] = useState('33BWZPN2210D1ZO');
  const [gstType, setGstType] = useState('regular');

  // Billing Settings
  const [billingType, setBillingType] = useState('both');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [billSeries, setBillSeries] = useState('2026');
  const [stockType, setStockType] = useState('unique');
  const [returnDays, setReturnDays] = useState('7');
  const [maxDiscount, setMaxDiscount] = useState('20');

  // Print & Language
  const [printType, setPrintType] = useState('thermal');
  const [language, setLanguage] = useState('both');

  // Branch Setup
  const [branchMode, setBranchMode] = useState('single');
  const [branches, setBranches] = useState<Branch[]>([
    { id: '1', name: 'Main Branch', address: '', phone: '' },
  ]);

  const addBranch = () => {
    setBranches([
      ...branches,
      { id: Date.now().toString(), name: '', address: '', phone: '' },
    ]);
  };

  const removeBranch = (id: string) => {
    if (branches.length > 1) {
      setBranches(branches.filter((b) => b.id !== id));
    }
  };

  const updateBranch = (id: string, field: keyof Branch, value: string) => {
    setBranches(branches.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    toast.success('Setup completed successfully!');
    navigate('/login');
  };

  return {
    currentStep,
    companyName,
    setCompanyName,
    companyAddress,
    setCompanyAddress,
    companyPhone,
    setCompanyPhone,
    companyEmail,
    setCompanyEmail,
    companyLogo,
    setCompanyLogo,
    gstEnabled,
    setGstEnabled,
    gstNumber,
    setGstNumber,
    gstType,
    setGstType,
    billingType,
    setBillingType,
    invoicePrefix,
    setInvoicePrefix,
    billSeries,
    setBillSeries,
    stockType,
    setStockType,
    returnDays,
    setReturnDays,
    maxDiscount,
    setMaxDiscount,
    printType,
    setPrintType,
    language,
    setLanguage,
    branchMode,
    setBranchMode,
    branches,
    addBranch,
    removeBranch,
    updateBranch,
    handleNext,
    handlePrev,
    handleComplete,
  };
}
