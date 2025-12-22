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
  const { toast } = useToast();

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^"|"$/g, ''));

    // Parse rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(',')
        .map((v) => v.trim().replace(/^"|"$/g, ''));
      
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
        return;
      }

      // Upload in batches to show progress
      const batchSize = 10;
      const totalBatches = Math.ceil(rows.length / batchSize);
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await onUpload(batch);
        setProgress(Math.round(((i + batch.length) / rows.length) * 100));
      }

      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${rows.length} items.`,
      });

      setFile(null);
      setIsOpen(false);
      setProgress(0);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading the file.',
      });
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
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
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

