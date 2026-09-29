import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReturnSearchCardProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export const ReturnSearchCard: React.FC<ReturnSearchCardProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
}) => {
  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" /> Find Original Bill
        </CardTitle>
        <CardDescription>
          Enter Bill Number or Customer Mobile Number to load purchase history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="INV-2024-0001 or 9876543210"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <Button onClick={onSearch} disabled={isSearching} size="lg" className="h-12 px-8">
            {isSearching ? 'Searching...' : 'Find Bill'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
