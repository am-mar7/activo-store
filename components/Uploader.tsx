"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { X, Upload, Image } from "lucide-react";

interface Props {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  existingImageUrls?: string[];
  onExistingImagesChange?: (urls: string[]) => void;
}

export default function Uploader({
  onImagesChange,
  maxFiles = 5,
  maxSizePerFile = 1,
  existingImageUrls,
  onExistingImagesChange,
}: Props) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  console.log(existingImageUrls);
  
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");

    const filesArray = Array.from(selectedFiles);

    if (
      (existingImageUrls?.length || 0) + images.length + filesArray.length >
      maxFiles
    ) {
      setError(
        `Maximum ${maxFiles} images allowed. You can add ${
          maxFiles - images.length
        } more.`
      );
      e.target.value = "";
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesArray) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image file`);
        continue;
      }

      if (file.size > maxSizePerFile * 1024 * 1024) {
        setError(`"${file.name}" exceeds ${maxSizePerFile}MB size limit`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      const updatedPreviews = [...previews, ...newPreviews];

      setImages(updatedImages);
      setPreviews(updatedPreviews);
      onImagesChange(updatedImages);
    }

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
    setError("");
  };

  const removeOldImage = (index: number) => {
    if (!existingImageUrls || !onExistingImagesChange) return;
    const newImages = existingImageUrls.filter((_, idx) => idx !== index) || [];
    onExistingImagesChange(newImages);
    setError("");
  };

  const clearAll = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    onImagesChange([]);
    setError("");
    if (onExistingImagesChange) onExistingImagesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mt-1">
            Upload up to {maxFiles} images (max {maxSizePerFile}MB each)
          </p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* File Input */}
      <div className="relative">
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={
            (existingImageUrls?.length || 0) + images.length >= maxFiles
          }
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${
              images.length >= maxFiles
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-primary-300 bg-primary-50 hover:bg-primary-100 hover:border-primary-400"
            }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload
              className={`w-8 h-8 mb-2 ${
                images.length >= maxFiles ? "text-gray-400" : "text-primary-500"
              }`}
            />
            <p
              className={`mb-2 text-sm ${
                images.length >= maxFiles ? "text-gray-500" : "text-gray-700"
              }`}
            >
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              {(existingImageUrls?.length || 0) + images.length}/{maxFiles}{" "}
              images selected
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg"
          role="alert"
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Preview Grid */}
      {(existingImageUrls?.length || 0) + images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingImageUrls?.map((url, index) => (
            <ImagePreview
              key={index}
              alt={`image-no-${index}`}
              isMain={index === 0}
              url={existingImageUrls[index]}
              onRemove={() => removeOldImage(index)}
            />
          ))}
          {images.map((file, index) => (
            <ImagePreview
              key={`${file.name}-${index}`}
              alt={`${file.name}-${index}`}
              fileName={file.name}
              isMain={index === 0 && !existingImageUrls?.length}
              url={previews[index]}
              onRemove={() => removeImage(index)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {(existingImageUrls?.length || 0) + images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            No images selected
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Click the upload area above to add images
          </p>
        </div>
      )}
    </div>
  );
}

interface ImagePreviewProps {
  url: string;
  alt: string;
  isMain?: boolean;
  onRemove: () => void;
  fileName?: string;
  fileSize?: number;
}
const ImagePreview = ({
  url,
  alt,
  isMain = false,
  onRemove,
  fileName,
  fileSize,
}: ImagePreviewProps) => {
  return (
    <div className="relative group rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
      {/* Image Preview */}
      <div className="aspect-square relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="w-full h-full object-cover" />

        {/* Main Image Badge */}
        {isMain && (
          <div className="absolute top-1.5 left-1.5 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Main
          </div>
        )}

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute z-2 top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Remove image ${alt}`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* File Info */}
      <div className="p-2 bg-white">
        {fileName && (
          <p className="text-xs text-gray-700 font-medium truncate">
            {fileName}
          </p>
        )}
        {fileSize && (
          <p className="text-xs text-gray-500">
            {(fileSize / 1024).toFixed(1)} KB
          </p>
        )}
      </div>
    </div>
  );
};
