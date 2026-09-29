import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepCompanyInfoProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  companyAddress: string;
  setCompanyAddress: (val: string) => void;
  companyPhone: string;
  setCompanyPhone: (val: string) => void;
  companyEmail: string;
  setCompanyEmail: (val: string) => void;
  companyLogo: File | null;
  setCompanyLogo: (val: File | null) => void;
}

export const StepCompanyInfo: React.FC<StepCompanyInfoProps> = ({
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
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">Shop / Company Name *</Label>
        <Input
          id="companyName"
          placeholder="Enter your shop name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyAddress">Address *</Label>
        <Input
          id="companyAddress"
          placeholder="Full address"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyPhone">Phone Number *</Label>
          <Input
            id="companyPhone"
            placeholder="Contact number"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Email (Optional)</Label>
          <Input
            id="companyEmail"
            type="email"
            placeholder="Email address"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Shop Logo (Optional)</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50">
            {companyLogo ? (
              <img
                src={URL.createObjectURL(companyLogo)}
                alt="Logo"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload"
              onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
            />
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>Upload Logo</span>
              </Button>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, max 2MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};
