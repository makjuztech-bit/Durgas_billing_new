import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Branch } from '@/components/setup/StepBranchSetup';

interface StepFinishProps {
  companyName: string;
  gstEnabled: boolean;
  billingType: string;
  printType: string;
  language: string;
  branches: Branch[];
}

export const StepFinish: React.FC<StepFinishProps> = ({
  companyName,
  gstEnabled,
  billingType,
  printType,
  language,
  branches,
}) => {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
        <Check className="h-10 w-10 text-success" />
      </div>
      <div>
        <h3 className="text-2xl font-bold">Setup Complete!</h3>
        <p className="mt-2 text-muted-foreground">Your Jewelry POS system is ready to use</p>
      </div>
      <Card className="text-left">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Configuration Summary:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shop Name</span>
              <span className="font-medium">{companyName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium">{gstEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Type</span>
              <span className="font-medium capitalize">{billingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Print Type</span>
              <span className="font-medium capitalize">{printType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium capitalize">{language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branches</span>
              <span className="font-medium">{branches.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
