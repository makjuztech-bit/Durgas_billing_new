import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Download,
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    Database,
    RefreshCw,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const DataMigration: React.FC = () => {
    const [module, setModule] = useState<string>('Products');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<any>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const response = await fetch(`${API_URL}/migration/export/${module}`);

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${module}_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`${module} data exported successfully`);
        } catch (error) {
            toast.error('Failed to export data');
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch(`${API_URL}/migration/template/${module}`);
            if (!response.ok) throw new Error('Template download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${module}_Template.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success('Template downloaded');
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        try {
            setIsImporting(true);
            setImportResult(null);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/migration/import`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setImportResult(data.results);
                toast.success('Import process completed');
            } else {
                toast.error(data.message || 'Import failed');
            }
        } catch (error) {
            toast.error('Error uploading file');
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Smart Data Migration</h1>
                    <p className="text-muted-foreground">Download, Edit, and Synchronize your data securely.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Export Section */}
                <Card className="border-0 shadow-sm h-full">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Download className="h-5 w-5" />
                            Download Data
                        </CardTitle>
                        <CardDescription>
                            Select a module to download its data for offline editing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>Select Module</Label>
                            <Select value={module} onValueChange={setModule}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Products">Products (Inventory)</SelectItem>
                                    <SelectItem value="Customers">Customers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                )}
                                {isExporting ? 'Exporting...' : `Download ${module} Data`}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleDownloadTemplate}
                            >
                                Download Empty Template
                            </Button>
                        </div>

                        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>How it works</AlertTitle>
                            <AlertDescription className="text-xs mt-1">
                                1. Download the current data file.<br />
                                2. Open it in Excel.<br />
                                3. Edit existing rows or add new ones.<br />
                                4. Save and Upload back to update the system.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Import Section */}
                <Card className="border-0 shadow-sm h-full">
                    <CardHeader className="bg-secondary/20 pb-4">
                        <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                            <Upload className="h-5 w-5" />
                            Upload & Sync
                        </CardTitle>
                        <CardDescription>
                            Upload your edited Excel file to update the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>Upload Excel File</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                            </div>
                            {file && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleImport}
                            disabled={!file || isImporting}
                        >
                            {isImporting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Database className="mr-2 h-4 w-4" />
                            )}
                            {isImporting ? 'Processing...' : 'Upload & Sync Data'}
                        </Button>

                        {importResult && (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">Import Results</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${importResult.failed > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {importResult.module}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-green-50 p-2 rounded">
                                            <div className="text-green-600 font-bold">{importResult.inserted}</div>
                                            <div className="text-xs text-muted-foreground">New</div>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded">
                                            <div className="text-blue-600 font-bold">{importResult.updated}</div>
                                            <div className="text-xs text-muted-foreground">Updated</div>
                                        </div>
                                        <div className="bg-red-50 p-2 rounded">
                                            <div className="text-red-600 font-bold">{importResult.failed}</div>
                                            <div className="text-xs text-muted-foreground">Failed</div>
                                        </div>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <div className="mt-2 text-xs text-red-600 max-h-32 overflow-y-auto bg-red-50 p-2 rounded">
                                            <strong>Errors:</strong>
                                            <ul className="list-disc list-inside mt-1">
                                                {importResult.errors.map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Admin Warning</AlertTitle>
                <AlertDescription>
                    This is a powerful tool directly affecting your live database. Always <strong>Download a Backup</strong> before preforming large bulk updates.
                </AlertDescription>
            </Alert>
        </div>
    );
};
