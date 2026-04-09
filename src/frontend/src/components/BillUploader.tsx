import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  CheckCircle2,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useExtractBillText, useUploadBill } from "../hooks/useInventory";
import type { Bill } from "../types";

interface BillUploaderProps {
  onExtracted: (bill: Bill, extractedText: string) => void;
}

export function BillUploader({ onExtracted }: BillUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [uploadedBill, setUploadedBill] = useState<Bill | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadBill = useUploadBill();
  const extractText = useExtractBillText();

  const isUploading = uploadBill.isPending;
  const isExtracting = extractText.isPending;
  const isBusy = isUploading || isExtracting;

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    setUploadedBill(null);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
      setFileBytes(bytes);
    };
    reader.readAsArrayBuffer(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setFileBytes(null);
    setUploadedBill(null);
    setUploadProgress(0);
    uploadBill.reset();
    extractText.reset();
  }

  async function handleUploadAndExtract() {
    if (!fileBytes || !fileName) return;

    let bill = uploadedBill;

    if (!bill) {
      try {
        const blob = ExternalBlob.fromBytes(
          fileBytes as Uint8Array<ArrayBuffer>,
        ).withUploadProgress((pct) => setUploadProgress(pct));
        bill = await uploadBill.mutateAsync({
          note: "",
          filename: fileName,
          image: blob,
        });
        setUploadedBill(bill);
        toast.success("Bill uploaded — extracting data…");
      } catch {
        toast.error("Failed to upload bill. Please try again.");
        return;
      }
    }

    try {
      const text = await extractText.mutateAsync(bill.id);
      onExtracted(bill, text);
      toast.success("Data extracted successfully!");
    } catch {
      toast.error("Extraction failed. You can edit fields manually.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone / preview */}
      {!preview ? (
        <button
          type="button"
          className="relative w-full border-2 border-dashed border-border rounded-xl bg-muted/30 flex flex-col items-center justify-center gap-3 py-10 px-4 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted/70"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          data-ocid="bill-dropzone"
          aria-label="Upload bill image"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileImage size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-foreground">
              Drop bill image here
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              or choose how to add it
            </p>
          </div>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border bg-card">
          <img
            src={preview}
            alt="Bill preview"
            className="w-full max-h-64 object-contain bg-muted/20"
          />
          {!isBusy && (
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove image"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/70 flex items-center justify-center hover:bg-foreground transition-colors"
            >
              <X size={16} className="text-background" />
            </button>
          )}
          <div className="px-3 py-2 flex items-center gap-2">
            <FileImage
              size={14}
              className="text-muted-foreground flex-shrink-0"
            />
            <span className="text-sm text-foreground truncate min-w-0 font-medium">
              {fileName}
            </span>
            {uploadedBill && (
              <Badge
                variant="secondary"
                className="ml-auto flex-shrink-0 bg-primary/10 text-primary border-0 text-xs"
              >
                <CheckCircle2 size={11} className="mr-1" />
                Uploaded
              </Badge>
            )}
          </div>
          {isUploading && (
            <div className="px-3 pb-2">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons row */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          data-ocid="bill-pick-file"
          disabled={isBusy}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <Upload size={16} className="text-primary" />
          Pick File
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          data-ocid="bill-camera"
          disabled={isBusy}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <Camera size={16} className="text-primary" />
          Camera
        </button>
      </div>

      {/* Extract button */}
      {preview && (
        <Button
          type="button"
          onClick={handleUploadAndExtract}
          disabled={isBusy || !fileBytes}
          data-ocid="bill-extract-btn"
          className="w-full h-12 text-base font-semibold"
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Uploading…
            </>
          ) : isExtracting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Extracting data…
            </>
          ) : uploadedBill ? (
            <>
              <CheckCircle2 size={18} className="mr-2" />
              Re-extract Data
            </>
          ) : (
            <>
              <FileImage size={18} className="mr-2" />
              Upload & Extract Data
            </>
          )}
        </Button>
      )}

      {/* Skeleton while extracting */}
      {isExtracting && (
        <div
          className="space-y-2 pt-1"
          aria-live="polite"
          aria-label="Extracting bill data"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        tabIndex={-1}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
        tabIndex={-1}
      />
    </div>
  );
}
