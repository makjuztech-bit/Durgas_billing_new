import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface StepBranchSetupProps {
  branchMode: string;
  setBranchMode: (val: string) => void;
  branches: Branch[];
  addBranch: () => void;
  removeBranch: (id: string) => void;
  updateBranch: (id: string, field: keyof Branch, value: string) => void;
}

export const StepBranchSetup: React.FC<StepBranchSetupProps> = ({
  branchMode,
  setBranchMode,
  branches,
  addBranch,
  removeBranch,
  updateBranch,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Branch Mode</Label>
        <RadioGroup value={branchMode} onValueChange={setBranchMode}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                branchMode === 'single' && 'border-primary bg-primary/5'
              )}
              onClick={() => setBranchMode('single')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="cursor-pointer font-medium">
                  Single Branch
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">One shop location</p>
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                branchMode === 'multi' && 'border-primary bg-primary/5'
              )}
              onClick={() => setBranchMode('multi')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi" id="multi" />
                <Label htmlFor="multi" className="cursor-pointer font-medium">
                  Multi Branch
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Multiple shop locations</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Branch Details</Label>
          {branchMode === 'multi' && (
            <Button variant="outline" size="sm" onClick={addBranch}>
              <Plus className="mr-1 h-4 w-4" />
              Add Branch
            </Button>
          )}
        </div>

        {branches.map((branch, index) => (
          <Card key={branch.id} className="border-dashed">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium">Branch {index + 1}</span>
                {branchMode === 'multi' && branches.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeBranch(branch.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Branch Name"
                  value={branch.name}
                  onChange={(e) => updateBranch(branch.id, 'name', e.target.value)}
                />
                <Input
                  placeholder="Branch Address"
                  value={branch.address}
                  onChange={(e) => updateBranch(branch.id, 'address', e.target.value)}
                />
                <Input
                  placeholder="Branch Phone"
                  value={branch.phone}
                  onChange={(e) => updateBranch(branch.id, 'phone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
