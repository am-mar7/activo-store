"use client";

import config from "@/lib/config";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
interface UploadedImageData {
  success: boolean;
  fileId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
}

export default function ImageKitUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(
    null
  );
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = `${config.env.apiEndPoint}/auth/image`;
      console.log(url);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data: UploadedImageData = await response.json();
      setUploadedImage(data);
      setFile(null);
      setPreview("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.log(errorMessage);
      setError("upload failed, please try again");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setFile(null);
    setPreview("");
    setError("");
  };

  return (
    <div className="max-w-sm p-6 bg-white rounded-lg shadow-lg border border-dashed border-primary-600">
      {!uploadedImage ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Choose Image
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100 cursor-pointer"
            />
          </div>

          {preview && file && (
            <div className="space-y-2 flex-center flex-col">
              <div className="relative flex-center w-full max-h-64 max-w-64 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-auto object-cover border-2 border-gray-200"
                />
              </div>
              <p className="text-sm w-full text-gray-600 mt-2">
                name: {file.name}
              </p>
              <p className="text-sm w-full text-gray-600">
                size: ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}

          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg"
              role="alert"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg
              hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={uploading ? "Uploading image" : "Upload image"}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload Image"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold flex items-center">
              <CheckCircle2 /> <span className="mx-2">Upload Successful!</span>
            </p>
          </div>

          <div className="space-y-3 flex-center flex-col">
            <div className="relative flex-center w-full max-h-64 max-w-64 rounded-lg overflow-hidden">
              <Image
                src={uploadedImage.url}
                alt={uploadedImage.name}
                width={400}
                height={400}
                unoptimized
                className="max-w-full h-auto object-cover border-2 border-gray-200"
                priority
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Image URL:
              </p>
              <p className="text-xs text-gray-600 break-all font-mono">
                {uploadedImage.url}
              </p>
            </div>

            <button
              onClick={resetUpload}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg
                hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Upload another image"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
