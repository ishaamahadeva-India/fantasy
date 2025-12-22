'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, generateImagePath } from '@/firebase/storage';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  folder: 'articles' | 'gossips' | 'advertisements' | 'cricketers' | 'movies' | 'stars' | 'teams';
  label?: string;
};

export function ImageUpload({ value, onChange, folder, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Image must be less than 5MB.',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    setUploading(true);
    try {
      const path = generateImagePath(file, folder);
      const downloadURL = await uploadImage(file, path);
      onChange(downloadURL);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been successfully uploaded.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Could not upload the image. Please try again.',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-4">
        {preview ? (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              {preview.startsWith('data:') ? (
                // Use regular img tag for data URLs (local preview)
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Use Next.js Image for Firebase URLs
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={`image-upload-${folder}`}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="w-8 h-8 mb-2 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                )}
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
              </div>
              <Input
                id={`image-upload-${folder}`}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

