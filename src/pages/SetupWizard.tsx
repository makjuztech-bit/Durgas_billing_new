import React from 'react';
import { Store, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { WizardProgressHeader, SETUP_STEPS } from '@/components/setup/WizardProgressHeader';
import { StepCompanyInfo } from '@/components/setup/StepCompanyInfo';
import { StepGstSettings } from '@/components/setup/StepGstSettings';
import { StepBillingSettings } from '@/components/setup/StepBillingSettings';
import { StepPrintLanguage } from '@/components/setup/StepPrintLanguage';
import { StepBranchSetup } from '@/components/setup/StepBranchSetup';
import { StepFinish } from '@/components/setup/StepFinish';
import { useSetupWizardState } from '@/components/setup/useSetupWizardState';


export const SetupWizard: React.FC = () => {
  const {
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
  } = useSetupWizardState();

  return (
    <div className="min-h-screen bg-gradient-cream silk-pattern flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-maroon shadow-maroon mb-4">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Setup Wizard</h1>
            <p className="mt-2 text-muted-foreground">Configure your Jewelry POS system</p>
          </div>

          {/* Progress Steps Header */}
          <WizardProgressHeader steps={SETUP_STEPS} currentStep={currentStep} />

          {/* Step Content */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {SETUP_STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {SETUP_STEPS.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <StepCompanyInfo
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  companyAddress={companyAddress}
                  setCompanyAddress={setCompanyAddress}
                  companyPhone={companyPhone}
                  setCompanyPhone={setCompanyPhone}
                  companyEmail={companyEmail}
                  setCompanyEmail={setCompanyEmail}
                  companyLogo={companyLogo}
                  setCompanyLogo={setCompanyLogo}
                />
              )}
              {currentStep === 2 && (
                <StepGstSettings
                  gstEnabled={gstEnabled}
                  setGstEnabled={setGstEnabled}
                  gstNumber={gstNumber}
                  setGstNumber={setGstNumber}
                  gstType={gstType}
                  setGstType={setGstType}
                />
              )}
              {currentStep === 3 && (
                <StepBillingSettings
                  billingType={billingType}
                  setBillingType={setBillingType}
                  invoicePrefix={invoicePrefix}
                  setInvoicePrefix={setInvoicePrefix}
                  billSeries={billSeries}
                  setBillSeries={setBillSeries}
                  stockType={stockType}
                  setStockType={setStockType}
                  returnDays={returnDays}
                  setReturnDays={setReturnDays}
                  maxDiscount={maxDiscount}
                  setMaxDiscount={setMaxDiscount}
                />
              )}
              {currentStep === 4 && (
                <StepPrintLanguage
                  printType={printType}
                  setPrintType={setPrintType}
                  language={language}
                  setLanguage={setLanguage}
                />
              )}
              {currentStep === 5 && (
                <StepBranchSetup
                  branchMode={branchMode}
                  setBranchMode={setBranchMode}
                  branches={branches}
                  addBranch={addBranch}
                  removeBranch={removeBranch}
                  updateBranch={updateBranch}
                />
              )}
              {currentStep === 6 && (
                <StepFinish
                  companyName={companyName}
                  gstEnabled={gstEnabled}
                  billingType={billingType}
                  printType={printType}
                  language={language}
                  branches={branches}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 6 ? (
              <Button variant="gold" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="gold" onClick={handleComplete}>
                Complete Setup
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
