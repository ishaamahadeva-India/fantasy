'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, AlertCircle, Info } from 'lucide-react';
import { uploadImage, generateImagePath } from '@/firebase/storage';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getImageSpec, formatImageSpec, type ImageSpec } from '@/constants/imageSpecs';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  folder: 'articles' | 'gossips' | 'advertisements' | 'cricketers' | 'movies' | 'stars' | 'teams';
  label?: string;
  position?: string; // For advertisements - specify position to get correct spec
  showSizeGuidance?: boolean; // Show size recommendations
};

export function ImageUpload({ 
  value, 
  onChange, 
  folder, 
  label = 'Image',
  position,
  showSizeGuidance = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get image spec based on position or folder
  const imageSpec = position 
    ? getImageSpec(position)
    : folder === 'advertisements' 
      ? getImageSpec('default')
      : getImageSpec(folder);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size
    const maxSizeBytes = imageSpec.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Image must be less than ${imageSpec.maxFileSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
      return;
    }

    // Create preview first
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Load image to check dimensions
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      setImageDimensions({ width, height });

      // Check dimensions (warn but don't block)
      const specWidth = imageSpec.width;
      const specHeight = imageSpec.height;
      const widthDiff = Math.abs(width - specWidth);
      const heightDiff = Math.abs(height - specHeight);
      const widthTolerance = specWidth * 0.2; // 20% tolerance
      const heightTolerance = specHeight * 0.2;

      if (widthDiff > widthTolerance || heightDiff > heightTolerance) {
        toast({
          variant: 'default',
          title: 'Image size warning',
          description: `Recommended size: ${specWidth}×${specHeight}px. Your image: ${width}×${height}px. The image may not display optimally.`,
          duration: 5000,
        });
      }

      // Upload to Firebase Storage
      setUploading(true);
      uploadImage(file, generateImagePath(file, folder))
        .then((downloadURL) => {
          onChange(downloadURL);
          toast({
            title: 'Image uploaded',
            description: 'Your image has been successfully uploaded.',
          });
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
          onChange('');
          toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: 'Could not upload the image. Please check CORS settings or try again. You can still save without an image.',
          });
          setPreview(null);
          setImageDimensions(null);
        })
        .finally(() => {
          setUploading(false);
          URL.revokeObjectURL(objectUrl);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        });
    };

    img.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Invalid image',
        description: 'Could not load the image. Please try a different file.',
      });
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setImageDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate aspect ratio for preview
  const aspectRatio = imageDimensions 
    ? `${imageDimensions.width}:${imageDimensions.height}`
    : imageSpec.aspectRatio;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {/* Size Guidance Alert */}
      {showSizeGuidance && (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-semibold">Recommended Image Size</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            <div className="space-y-1">
              <p><strong>Dimensions:</strong> {imageSpec.width}×{imageSpec.height}px ({imageSpec.aspectRatio} aspect ratio)</p>
              <p><strong>Max Size:</strong> {imageSpec.maxFileSizeMB}MB</p>
              <p><strong>Formats:</strong> {imageSpec.recommendedFormat.join(', ')}</p>
              {imageSpec.description && (
                <p className="text-muted-foreground italic">{imageSpec.description}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Image Dimensions */}
      {imageDimensions && (
        <Alert className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Current image: <strong>{imageDimensions.width}×{imageDimensions.height}px</strong>
            {imageDimensions.width !== imageSpec.width || imageDimensions.height !== imageSpec.height ? (
              <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                (Recommended: {imageSpec.width}×{imageSpec.height}px)
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400 ml-2">✓ Perfect size</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {preview ? (
          <div className="relative w-full max-w-md">
            <div 
              className="relative w-full overflow-hidden rounded-lg border"
              style={{ 
                aspectRatio: aspectRatio,
                maxHeight: '400px'
              }}
            >
              {preview.startsWith('data:') ? (
                // Use regular img tag for data URLs (local preview)
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                // Use Next.js Image for Firebase URLs
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-contain"
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
                <p className="text-xs text-muted-foreground">
                  {imageSpec.recommendedFormat.join(', ')} up to {imageSpec.maxFileSizeMB}MB
                </p>
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

