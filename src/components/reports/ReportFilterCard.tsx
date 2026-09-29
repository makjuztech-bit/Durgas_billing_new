import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportFilterCardProps {
  reportType: string;
  setReportType: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  onGenerate: () => void;
}

export const ReportFilterCard: React.FC<ReportFilterCardProps> = ({
  reportType,
  setReportType,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onGenerate,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-[250px] space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dailysales">Daily Sales</SelectItem>
                <SelectItem value="stock">Stock Analysis</SelectItem>
                <SelectItem value="category">Category Performance</SelectItem>
                <SelectItem value="staff">Salesman Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-[200px] space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="w-full md:w-[200px] space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button className="w-full md:w-auto" onClick={onGenerate}>
            <Filter className="mr-2 h-4 w-4" /> Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
