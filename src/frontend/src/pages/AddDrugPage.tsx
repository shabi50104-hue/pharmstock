import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  PenLine,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BillUploader } from "../components/BillUploader";
import { useAddBatch, useAddDrug, useListDrugs } from "../hooks/useInventory";
import type { Bill } from "../types";

interface AddDrugPageProps {
  onSuccess: () => void;
}

type ActiveTab = "upload" | "review" | "manual";

interface ExtractedFields {
  drugName: string;
  batchNumber: string;
  quantity: string;
  purchasePrice: string;
  expiryDate: string;
  rawText: string;
}

function parseExtractedText(text: string): Partial<ExtractedFields> {
  const fields: Partial<ExtractedFields> = { rawText: text };

  const nameMatch =
    text.match(/drug\s*(?:name)?[:\s]+([^\n,]+)/i) ||
    text.match(/product\s*(?:name)?[:\s]+([^\n,]+)/i) ||
    text.match(/medicine[:\s]+([^\n,]+)/i);
  if (nameMatch) fields.drugName = nameMatch[1].trim();

  const batchMatch =
    text.match(/batch\s*(?:no\.?|number)?[:\s#]+([A-Z0-9-]+)/i) ||
    text.match(/lot\s*(?:no\.?|number)?[:\s#]+([A-Z0-9-]+)/i);
  if (batchMatch) fields.batchNumber = batchMatch[1].trim();

  const qtyMatch =
    text.match(/qty[:\s]+(\d+)/i) ||
    text.match(/quantity[:\s]+(\d+)/i) ||
    text.match(/units?[:\s]+(\d+)/i);
  if (qtyMatch) fields.quantity = qtyMatch[1].trim();

  const priceMatch =
    text.match(/price[:\s]+[\$£€]?\s*([\d.,]+)/i) ||
    text.match(/cost[:\s]+[\$£€]?\s*([\d.,]+)/i) ||
    text.match(/amount[:\s]+[\$£€]?\s*([\d.,]+)/i);
  if (priceMatch) fields.purchasePrice = priceMatch[1].replace(",", "").trim();

  const expiryMatch =
    text.match(
      /exp(?:iry)?\.?\s*(?:date)?[:\s]+(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
    ) ||
    text.match(/exp(?:iry)?\.?\s*(?:date)?[:\s]+([A-Za-z]+\s+\d{4})/i) ||
    text.match(/best\s*before[:\s]+(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
  if (expiryMatch) {
    const raw = expiryMatch[1].trim();
    try {
      const d = new Date(raw.replace(/[\/\-\.]/g, "-"));
      if (!Number.isNaN(d.getTime())) {
        fields.expiryDate = d.toISOString().split("T")[0];
      }
    } catch {
      // leave blank — user will fill manually
    }
  }

  return fields;
}

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  ocid: string;
}

function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  ocid,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-ocid={ocid}
        className="h-11 bg-card border-border"
      />
    </div>
  );
}

export function AddDrugPage({ onSuccess }: AddDrugPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>({
    drugName: "",
    batchNumber: "",
    quantity: "",
    purchasePrice: "",
    expiryDate: "",
    rawText: "",
  });

  const [manualDrugName, setManualDrugName] = useState("");
  const [manualManufacturer, setManualManufacturer] = useState("");
  const [manualBatch, setManualBatch] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");

  const { data: existingDrugs = [] } = useListDrugs();
  const addDrug = useAddDrug();
  const addBatch = useAddBatch();
  const isSaving = addDrug.isPending || addBatch.isPending;

  function handleExtracted(_bill: Bill, text: string) {
    const parsed = parseExtractedText(text);
    setExtractedFields({
      drugName: parsed.drugName ?? "",
      batchNumber: parsed.batchNumber ?? "",
      quantity: parsed.quantity ?? "",
      purchasePrice: parsed.purchasePrice ?? "",
      expiryDate: parsed.expiryDate ?? "",
      rawText: parsed.rawText ?? text,
    });
    setActiveTab("review");
  }

  async function saveToInventory(
    name: string,
    manufacturer: string,
    batchNumber: string,
    quantity: number,
    purchasePrice: number,
    expiryDateStr: string,
  ) {
    try {
      const existing = existingDrugs.find(
        (d) => d.drug.name.toLowerCase() === name.toLowerCase(),
      );

      let drugId: bigint;
      if (existing) {
        drugId = existing.drug.id;
      } else {
        const drug = await addDrug.mutateAsync({
          name,
          manufacturer: manufacturer || "Unknown",
          description: "",
          salePrice: 0,
        });
        drugId = drug.id;
      }

      const expiryMs = new Date(expiryDateStr).getTime();
      await addBatch.mutateAsync({
        drugId,
        batchNumber,
        quantity: BigInt(quantity),
        purchasePrice,
        expiryDate: BigInt(expiryMs) * 1_000_000n,
      });

      toast.success(`${name} added to inventory!`);
      onSuccess();
    } catch {
      toast.error("Failed to save. Check the details and try again.");
    }
  }

  async function handleSaveExtracted() {
    const { drugName, batchNumber, quantity, purchasePrice, expiryDate } =
      extractedFields;
    if (!drugName.trim()) {
      toast.error("Drug name is required");
      return;
    }
    if (!batchNumber.trim()) {
      toast.error("Batch number is required");
      return;
    }
    if (!expiryDate) {
      toast.error("Expiry date is required");
      return;
    }
    await saveToInventory(
      drugName.trim(),
      "",
      batchNumber.trim(),
      Number(quantity) || 0,
      Number(purchasePrice) || 0,
      expiryDate,
    );
  }

  async function handleSaveManual() {
    if (!manualDrugName.trim()) {
      toast.error("Drug name is required");
      return;
    }
    if (!manualBatch.trim()) {
      toast.error("Batch number is required");
      return;
    }
    if (!manualExpiry) {
      toast.error("Expiry date is required");
      return;
    }
    await saveToInventory(
      manualDrugName.trim(),
      manualManufacturer.trim(),
      manualBatch.trim(),
      Number(manualQty) || 0,
      Number(manualPrice) || 0,
      manualExpiry,
    );
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "Upload Bill", icon: <FileText size={15} /> },
    { id: "review", label: "Review Data", icon: <ClipboardList size={15} /> },
    { id: "manual", label: "Add Manually", icon: <PenLine size={15} /> },
  ];

  return (
    <div className="px-4 pt-5 pb-8 space-y-5" data-ocid="add-drug-page">
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          Add Drug
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload a bill to extract data or add a drug manually
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex rounded-xl bg-muted/50 p-1 gap-0.5"
        role="tablist"
        aria-label="Add drug method"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            data-ocid={`add-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all leading-none ${
              activeTab === tab.id
                ? "bg-card shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === "review" && extractedFields.drugName && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Upload Bill */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 flex gap-2.5">
            <AlertCircle
              size={15}
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-foreground leading-relaxed">
              Take a clear photo of your purchase bill. The app will
              automatically extract drug name, batch number, quantity, price,
              and expiry date for you to review.
            </p>
          </div>
          <BillUploader onExtracted={handleExtracted} />
        </div>
      )}

      {/* Review Extracted Data */}
      {activeTab === "review" && (
        <div className="space-y-4">
          {!extractedFields.drugName && !extractedFields.rawText ? (
            <div
              className="flex flex-col items-center gap-3 py-12 text-center"
              data-ocid="review-empty-state"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <ClipboardList size={26} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  No data extracted yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a bill first to auto-fill the fields below
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("upload")}
                data-ocid="review-go-upload"
              >
                <FileText size={14} className="mr-1.5" />
                Go to Upload
              </Button>
            </div>
          ) : (
            <>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-xs"
              >
                <CheckCircle2 size={11} className="mr-1" />
                Data extracted — review and edit before saving
              </Badge>

              <div className="space-y-3">
                <FormField
                  label="Drug Name *"
                  id="ext-drug-name"
                  value={extractedFields.drugName}
                  onChange={(v) =>
                    setExtractedFields((p) => ({ ...p, drugName: v }))
                  }
                  placeholder="e.g. Paracetamol 500mg"
                  ocid="ext-drug-name"
                />
                <FormField
                  label="Batch Number *"
                  id="ext-batch"
                  value={extractedFields.batchNumber}
                  onChange={(v) =>
                    setExtractedFields((p) => ({ ...p, batchNumber: v }))
                  }
                  placeholder="e.g. B00147"
                  ocid="ext-batch"
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Quantity"
                    id="ext-qty"
                    type="number"
                    value={extractedFields.quantity}
                    onChange={(v) =>
                      setExtractedFields((p) => ({ ...p, quantity: v }))
                    }
                    placeholder="0"
                    ocid="ext-qty"
                  />
                  <FormField
                    label="Purchase Price"
                    id="ext-price"
                    type="number"
                    value={extractedFields.purchasePrice}
                    onChange={(v) =>
                      setExtractedFields((p) => ({ ...p, purchasePrice: v }))
                    }
                    placeholder="0.00"
                    ocid="ext-price"
                  />
                </div>
                <FormField
                  label="Expiry Date *"
                  id="ext-expiry"
                  type="date"
                  value={extractedFields.expiryDate}
                  onChange={(v) =>
                    setExtractedFields((p) => ({ ...p, expiryDate: v }))
                  }
                  placeholder=""
                  ocid="ext-expiry"
                />
              </div>

              {extractedFields.rawText && (
                <details className="group">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors select-none list-none flex items-center gap-1">
                    <span className="underline underline-offset-2">
                      Show raw extracted text
                    </span>
                  </summary>
                  <pre className="mt-2 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                    {extractedFields.rawText}
                  </pre>
                </details>
              )}

              <Button
                type="button"
                onClick={handleSaveExtracted}
                disabled={isSaving}
                data-ocid="review-save-btn"
                className="w-full h-12 text-base font-semibold"
              >
                {isSaving ? (
                  "Saving…"
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Save to Inventory
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Add Manually */}
      {activeTab === "manual" && (
        <div className="space-y-3">
          <FormField
            label="Drug Name *"
            id="man-drug-name"
            value={manualDrugName}
            onChange={setManualDrugName}
            placeholder="e.g. Amoxicillin 250mg"
            ocid="man-drug-name"
          />
          <FormField
            label="Manufacturer"
            id="man-manufacturer"
            value={manualManufacturer}
            onChange={setManualManufacturer}
            placeholder="e.g. GSK Pharma"
            ocid="man-manufacturer"
          />
          <FormField
            label="Batch Number *"
            id="man-batch"
            value={manualBatch}
            onChange={setManualBatch}
            placeholder="e.g. B99831"
            ocid="man-batch"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Quantity"
              id="man-qty"
              type="number"
              value={manualQty}
              onChange={setManualQty}
              placeholder="0"
              ocid="man-qty"
            />
            <FormField
              label="Purchase Price"
              id="man-price"
              type="number"
              value={manualPrice}
              onChange={setManualPrice}
              placeholder="0.00"
              ocid="man-price"
            />
          </div>
          <FormField
            label="Expiry Date *"
            id="man-expiry"
            type="date"
            value={manualExpiry}
            onChange={setManualExpiry}
            placeholder=""
            ocid="man-expiry"
          />

          <Button
            type="button"
            onClick={handleSaveManual}
            disabled={isSaving}
            data-ocid="manual-save-btn"
            className="w-full h-12 text-base font-semibold mt-1"
          >
            {isSaving ? (
              "Saving…"
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                Add to Inventory
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
