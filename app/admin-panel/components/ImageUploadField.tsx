'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppImage from '@/components/ui/AppImage';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  required = false,
  error,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { upsert: false, contentType: file.type });

        if (error) {
          setUploadError('Upload failed: ' + error.message);
          return;
        }

        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        onChange(publicData.publicUrl);
      } catch {
        setUploadError('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [supabase, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleClear = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          {label} {required && '*'}
        </label>
      )}

      {/* Preview */}
      {value && (
        <div className="relative mb-2 inline-block">
          <AppImage
            src={value}
            alt="Product image preview"
            width={80}
            height={80}
            className="w-20 h-20 rounded-xl object-cover border border-border"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground rounded-full p-0.5 hover:bg-accent/80 transition-colors"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!value && (
        <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-muted/30 min-h-[80px]">
          <ImageIcon size={24} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            Take a photo or browse a file
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-2">
        {/* Camera capture */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Camera size={13} />
          Take Photo
        </button>

        {/* File browse */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Upload size={13} />
          Browse File
        </button>

        {uploading && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Uploading…
          </span>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {(uploadError || error) && (
        <p className="text-xs text-accent mt-1">{uploadError || error}</p>
      )}
    </div>
  );
}
