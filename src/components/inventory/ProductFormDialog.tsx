import React from 'react';
import {
  RotateCcw,
  Copy,
  Save,
  Printer,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Saree } from '@/types';
import { categories, departments } from './inventoryConstants';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: Partial<Saree>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Saree>>>;
  onSave: () => void;
  onSaveAndPrint: () => void;
  onReset: () => void;
  onGenerateCode: () => void;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  onSave,
  onSaveAndPrint,
  onReset,
  onGenerateCode,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string],
        }));
        toast.success('Image attached successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            Enter complete details of the apparel / product item
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Department & Stock Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department || 'Jewelry'}
                  onValueChange={(val: any) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Type</Label>
                <Select
                  value={formData.stockType || 'bulk'}
                  onValueChange={(val: any) =>
                    setFormData({
                      ...formData,
                      stockType: val,
                      stockQty: val === 'unique' ? 1 : formData.stockQty,
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unique">Unique (Single Piece)</SelectItem>
                    <SelectItem value="bulk">Bulk (Quantity Based)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <Label>Product Code / Barcode *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.sareeCode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sareeCode: e.target.value,
                        barcode: e.target.value,
                      })
                    }
                    placeholder="Enter or generate code"
                  />
                  <Button variant="outline" size="icon" onClick={onGenerateCode}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  The Product Code will be used as the Barcode for scanning and label printing.
                </p>
              </div>
            </div>

            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name (English) *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="22K Gold Chain"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-tamil">பொருள் பெயர் (தமிழ்)</Label>
                <Input
                  value={formData.nameTamil || ''}
                  onChange={(e) => setFormData({ ...formData, nameTamil: e.target.value })}
                  placeholder="22K தங்க சங்கிலி"
                  className="font-tamil"
                />
              </div>
            </div>

            {/* Category & Brand */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category || 'bridal'}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand / Weaver / Manufacturer</Label>
                <Input
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Sri Kumaran"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the product piece..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Purchase Cost (₹) *</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: Number(e.target.value) })
                  }
                  placeholder="18000"
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                  }
                  placeholder="22500"
                />
              </div>
              <div className="space-y-2">
                <Label>MRP (₹) *</Label>
                <Input
                  type="number"
                  value={formData.mrp || ''}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  placeholder="25000"
                />
              </div>
            </div>

            {/* Profit Margin Box */}
            {formData.purchasePrice && formData.sellingPrice && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-xs text-emerald-800 font-semibold uppercase">Estimated Margin</p>
                <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                  ₹{((formData.sellingPrice || 0) - (formData.purchasePrice || 0)).toLocaleString('en-IN')}
                  <span className="ml-2 text-xs font-normal">
                    ({(
                      (((formData.sellingPrice || 0) - (formData.purchasePrice || 0)) /
                        (formData.purchasePrice || 1)) *
                      100
                    ).toFixed(1)}
                    % margin)
                  </span>
                </p>
              </div>
            )}

            {/* GST % */}
            <div className="space-y-2">
              <Label>GST %</Label>
              <Select
                value={formData.gstPercent?.toString() || '5'}
                onValueChange={(v) => setFormData({ ...formData, gstPercent: Number(v) })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Stock */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stockQty || ''}
                  disabled={formData.stockType === 'unique'}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQty: Number(e.target.value) })
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Rack Location</Label>
                <Input
                  value={formData.rackLocation || ''}
                  onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                  placeholder="A1-01"
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Kanchipuram Weavers Co-op"
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center relative hover:bg-muted/50 transition-colors">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 font-medium">Add Image</p>
                <p className="text-sm text-muted-foreground">Click to upload photo</p>
                <Input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Uploaded ${i + 1}`}
                        className="h-24 w-full object-cover rounded-lg border"
                      />
                      <button
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = [...(formData.images || [])];
                          newImages.splice(i, 1);
                          setFormData({ ...formData, images: newImages });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const current = { ...formData };
              onReset();
              setFormData({ ...current, sareeCode: '', barcode: '', id: '' });
              toast.info('Form duplicated - modify and save as new');
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="default" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={onSaveAndPrint} className="bg-primary/10 text-primary border-primary/20">
            <Printer className="mr-2 h-4 w-4" />
            Save & Print Barcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
