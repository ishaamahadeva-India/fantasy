'use client';

import { useState, useRef } from 'react';
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
  onUpload: (rows: any[], currentIndex?: number, total?: number) => Promise<void>;
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
  const [isCancelled, setIsCancelled] = useState(false);
  const uploadAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const { toast } = useToast();

  const parseCSV = (text: string): any[] => {
    // Normalize line endings (handle Windows \r\n, Mac \r, Unix \n)
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n').filter((line) => line.trim());
    
    if (lines.length === 0) {
      console.warn('⚠️ CSV file appears to be empty');
      return [];
    }

    console.log(`📄 CSV file has ${lines.length} lines (including header)`);

    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log(`📋 Found ${headers.length} columns:`, headers);

    // Parse rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = parseCSVLine(line);
      
      // Check if row has any non-empty values
      if (values.some((v) => v && v.trim())) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = (values[index] || '').trim();
        });
        rows.push(row);
      } else {
        console.warn(`⚠️ Skipping empty row ${i + 1}`);
      }
    }

    console.log(`✅ Parsed ${rows.length} data rows from CSV`);
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
    setIsCancelled(false);
    uploadAbortRef.current.cancelled = false;
    setUploadStatus({ current: 0, total: 0 });

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      console.log(`📊 Parsed CSV: Found ${rows.length} rows`);
      if (rows.length > 0) {
        console.log('First row sample:', rows[0]);
      }

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
      console.log(`🚀 Starting upload of ${rows.length} items...`);

      // Process items one by one for better progress tracking and error handling
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Process each item sequentially
      for (let i = 0; i < rows.length; i++) {
        // Check if cancelled
        if (uploadAbortRef.current.cancelled) {
          console.log(`⏹️ Upload cancelled at item ${i + 1}`);
          toast({
            variant: 'default',
            title: 'Upload Cancelled',
            description: `Upload stopped. ${successCount} items uploaded before cancellation.`,
          });
          break;
        }

        try {
          // Update progress before processing
          setUploadStatus({ current: i + 1, total: rows.length });
          setProgress(Math.round(((i + 1) / rows.length) * 100));
          
          console.log(`📤 Uploading item ${i + 1}/${rows.length}: "${rows[i].title || 'Untitled'}"`);
          
          // Process single item with timeout
          await Promise.race([
            onUpload([rows[i]], i + 1, rows.length),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
            )
          ]);
          
          successCount++;
          console.log(`✅ Successfully uploaded item ${i + 1}/${rows.length}`);
        } catch (error: any) {
          // Continue processing even if an item fails
          errorCount++;
          const errorMsg = error.message || 'Unknown error';
          errors.push(`Row ${i + 1}: ${errorMsg}`);
          console.error(`❌ Error processing row ${i + 1}:`, error);
          
          // Don't stop on individual errors, but log them
          if (error.message?.includes('timeout')) {
            console.warn(`⏱️ Timeout on row ${i + 1}, continuing...`);
          }
        }
      }

      console.log(`✅ Upload complete: ${successCount} succeeded, ${errorCount} failed`);
      
      if (errorCount === 0) {
        toast({
          title: 'Upload Successful',
          description: `Successfully uploaded ${successCount} of ${rows.length} items.`,
        });
      } else if (successCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Partial Upload',
          description: `Uploaded ${successCount} of ${rows.length} items. ${errorCount} failed. Check console for details.`,
        });
        console.error('❌ Upload errors:', errors);
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: `Failed to upload all ${errorCount} items. Check console for details.`,
        });
        console.error('❌ Upload errors:', errors);
        throw new Error(`All ${errorCount} items failed to upload`);
      }

      if (!uploadAbortRef.current.cancelled) {
        setFile(null);
        setIsOpen(false);
      }
      setProgress(0);
      setUploadStatus(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      if (!uploadAbortRef.current.cancelled) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'An error occurred while uploading the file.',
        });
      }
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
      uploadAbortRef.current.cancelled = false;
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
                <span className="font-medium">
                  {uploadStatus ? `Uploading ${uploadStatus.current} of ${uploadStatus.total} items...` : 'Uploading...'}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {uploadStatus && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Processing item {uploadStatus.current} of {uploadStatus.total}</span>
                  <span>{Math.round((uploadStatus.current / uploadStatus.total) * 100)}% complete</span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (isUploading) {
                  uploadAbortRef.current.cancelled = true;
                  setIsCancelled(true);
                  setIsUploading(false);
                  setUploadStatus(null);
                  toast({
                    title: 'Upload Cancelled',
                    description: 'The upload has been cancelled.',
                  });
                } else {
                  setIsOpen(false);
                  setFile(null);
                }
              }}
            >
              {isUploading ? 'Cancel Upload' : 'Cancel'}
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

