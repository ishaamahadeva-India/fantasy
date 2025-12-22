'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface CSVUploadProps {
  onUpload: (rows: any[]) => Promise<void>;
  title: string;
  description: string;
  exampleHeaders?: string[];
  buttonText?: string;
  onDownloadTemplate?: () => void;
}

export function CSVUpload({
  onUpload,
  title,
  description,
  exampleHeaders = [],
  buttonText = 'Upload CSV',
  onDownloadTemplate,
}: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{ current: number; total: number } | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.some((v) => v)) {
        // Only add non-empty rows
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }

    return rows;
  };

  // Proper CSV line parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select a CSV file.',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadStatus({ current: 0, total: 0 });

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Empty File',
          description: 'The CSV file appears to be empty or invalid.',
        });
        setIsUploading(false);
        setUploadStatus(null);
        return;
      }

      setUploadStatus({ current: 0, total: rows.length });

      // Upload in batches to show progress
      const batchSize = 5; // Smaller batches for better progress tracking
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      let processedCount = 0;
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        try {
          await onUpload(batch);
          successCount += batch.length;
          processedCount += batch.length;
        } catch (error: any) {
          // Continue processing even if a batch fails
          errorCount += batch.length;
          processedCount += batch.length;
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message || 'Unknown error'}`);
        }
        setUploadStatus({ current: processedCount, total: rows.length });
        setProgress(Math.round((processedCount / rows.length) * 100));
      }

      if (errorCount === 0) {
        toast({
          title: 'Upload Successful',
          description: `Successfully uploaded ${successCount} items.`,
        });
      } else if (successCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Partial Upload',
          description: `Uploaded ${successCount} items. ${errorCount} items failed. Check console for details.`,
        });
        console.error('Upload errors:', errors);
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: `Failed to upload ${errorCount} items. Check console for details.`,
        });
        console.error('Upload errors:', errors);
        throw new Error('All items failed to upload');
      }

      setFile(null);
      setIsOpen(false);
      setProgress(0);
      setUploadStatus(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading the file.',
      });
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {exampleHeaders.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Expected CSV Headers:</p>
                {onDownloadTemplate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadTemplate}
                    className="h-7"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download Template
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {exampleHeaders.join(', ')}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload-input"
              disabled={isUploading}
            />
            <label
              htmlFor="csv-upload-input"
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors">
                {file ? (
                  <div className="text-center">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to select CSV file
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {uploadStatus ? `Uploading ${uploadStatus.current} of ${uploadStatus.total} items...` : 'Uploading...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              {uploadStatus && (
                <p className="text-xs text-muted-foreground text-center">
                  Processing item {uploadStatus.current} of {uploadStatus.total}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFile(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

