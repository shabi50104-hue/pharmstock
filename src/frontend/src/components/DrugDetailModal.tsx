import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Package,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteBatch,
  useDeleteDrug,
  useGetDrug,
  useUpdateBatch,
  useUpdateDrug,
} from "../hooks/useInventory";
import type { Batch, BatchId, DrugId } from "../types";
import { formatDateDisplay, getStatusMeta, getStockStatus } from "./DrugCard";

// ── Edit Drug Form ───────────────────────────────────────────────────────────

interface EditDrugFormProps {
  drug: {
    id: DrugId;
    name: string;
    manufacturer: string;
    description: string;
    salePrice: number;
  };
  onDone: () => void;
}

function EditDrugForm({ drug, onDone }: EditDrugFormProps) {
  const [name, setName] = useState(drug.name);
  const [manufacturer, setManufacturer] = useState(drug.manufacturer);
  const [description, setDescription] = useState(drug.description);
  const [salePrice, setSalePrice] = useState(drug.salePrice.toString());
  const updateDrug = useUpdateDrug();

  const handleSave = async () => {
    const price = Number.parseFloat(salePrice);
    if (!name.trim()) {
      toast.error("Drug name is required");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid sale price");
      return;
    }
    try {
      await updateDrug.mutateAsync({
        id: drug.id,
        input: {
          name: name.trim(),
          manufacturer: manufacturer.trim(),
          description: description.trim(),
          salePrice: price,
        },
      });
      toast.success("Drug updated");
      onDone();
    } catch {
      toast.error("Failed to update drug");
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 space-y-3"
      data-ocid="edit-drug-form"
    >
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-sm text-foreground">
          Edit Drug Info
        </p>
        <button
          type="button"
          onClick={onDone}
          aria-label="Cancel edit"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <Label htmlFor="edit-name" className="text-xs">
            Drug Name
          </Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 text-sm"
            data-ocid="edit-drug-name"
          />
        </div>
        <div>
          <Label htmlFor="edit-mfr" className="text-xs">
            Manufacturer
          </Label>
          <Input
            id="edit-mfr"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="mt-1 h-9 text-sm"
            data-ocid="edit-drug-manufacturer"
          />
        </div>
        <div>
          <Label htmlFor="edit-desc" className="text-xs">
            Description
          </Label>
          <Input
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-9 text-sm"
            data-ocid="edit-drug-description"
          />
        </div>
        <div>
          <Label htmlFor="edit-price" className="text-xs">
            Sale Price (₹)
          </Label>
          <Input
            id="edit-price"
            type="number"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="mt-1 h-9 text-sm"
            data-ocid="edit-drug-price"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onDone}
          data-ocid="edit-drug-cancel"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={updateDrug.isPending}
          data-ocid="edit-drug-save"
        >
          {updateDrug.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// ── Edit Batch Form ──────────────────────────────────────────────────────────

interface EditBatchFormProps {
  batch: Batch;
  drugId: DrugId;
  onDone: () => void;
}

function EditBatchForm({ batch, drugId, onDone }: EditBatchFormProps) {
  const [quantity, setQuantity] = useState(batch.quantity.toString());
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date(Number(batch.expiryDate) / 1_000_000);
    return d.toISOString().split("T")[0];
  });
  const [purchasePrice, setPurchasePrice] = useState(
    batch.purchasePrice.toString(),
  );
  const updateBatch = useUpdateBatch();

  const handleSave = async () => {
    const qty = Number.parseInt(quantity, 10);
    const price = Number.parseFloat(purchasePrice);
    if (Number.isNaN(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid purchase price");
      return;
    }
    if (!expiryDate) {
      toast.error("Expiry date is required");
      return;
    }
    try {
      await updateBatch.mutateAsync({
        batchId: batch.id,
        input: {
          batchNumber: batch.batchNumber,
          drugId,
          quantity: BigInt(qty),
          expiryDate: BigInt(new Date(expiryDate).getTime()) * 1_000_000n,
          purchasePrice: price,
          manufacturedDate: batch.manufacturedDate,
        },
      });
      toast.success("Batch updated");
      onDone();
    } catch {
      toast.error("Failed to update batch");
    }
  };

  return (
    <div
      className="bg-secondary/40 border border-border rounded-lg p-3 space-y-2 mt-2"
      data-ocid="edit-batch-form"
    >
      <p className="text-xs font-semibold text-foreground">Edit Batch</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`qty-${batch.id}`} className="text-xs">
            Quantity
          </Label>
          <Input
            id={`qty-${batch.id}`}
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 h-8 text-xs"
            data-ocid="edit-batch-qty"
          />
        </div>
        <div>
          <Label htmlFor={`price-${batch.id}`} className="text-xs">
            Buy Price (₹)
          </Label>
          <Input
            id={`price-${batch.id}`}
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="mt-1 h-8 text-xs"
            data-ocid="edit-batch-price"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor={`exp-${batch.id}`} className="text-xs">
            Expiry Date
          </Label>
          <Input
            id={`exp-${batch.id}`}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="mt-1 h-8 text-xs"
            data-ocid="edit-batch-expiry"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={onDone}
          data-ocid="edit-batch-cancel"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={handleSave}
          disabled={updateBatch.isPending}
          data-ocid="edit-batch-save"
        >
          {updateBatch.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── Batch Row ────────────────────────────────────────────────────────────────

interface BatchRowProps {
  batch: Batch;
  drugId: DrugId;
}

function BatchRow({ batch, drugId }: BatchRowProps) {
  const [editing, setEditing] = useState(false);
  const deleteBatch = useDeleteBatch();
  const expMs = Number(batch.expiryDate) / 1_000_000;
  const now = Date.now();
  const isExpired = expMs < now;
  const daysToExpiry = Math.ceil((expMs - now) / (1000 * 60 * 60 * 24));
  const isExpiring = !isExpired && daysToExpiry <= 30;

  const handleDeleteBatch = async (batchId: BatchId) => {
    if (!confirm("Delete this batch permanently?")) return;
    try {
      await deleteBatch.mutateAsync(batchId);
      toast.success("Batch deleted");
    } catch {
      toast.error("Failed to delete batch");
    }
  };

  return (
    <div
      className={`bg-card border rounded-lg p-3 space-y-1.5 transition-colors ${isExpired ? "border-destructive/40 bg-destructive/5" : isExpiring ? "border-amber-300/60 bg-amber-50/30" : "border-border"}`}
      data-ocid={`batch-row-${batch.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-semibold text-sm text-foreground truncate">
            {batch.batchNumber}
          </span>
          <Badge
            variant={
              isExpired ? "destructive" : isExpiring ? "outline" : "secondary"
            }
            className={`text-xs flex-shrink-0 ${isExpiring && !isExpired ? "border-amber-400 text-amber-700 bg-amber-50" : ""}`}
          >
            {isExpired
              ? "Expired"
              : isExpiring
                ? `${daysToExpiry}d left`
                : "Active"}
          </Badge>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-label="Edit batch"
            data-ocid={`edit-batch-btn-${batch.id}`}
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteBatch(batch.id)}
            aria-label="Delete batch"
            data-ocid={`delete-batch-btn-${batch.id}`}
            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Qty</p>
          <p className="font-bold text-foreground">
            {batch.quantity.toString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Expiry</p>
          <p
            className={`font-semibold ${isExpired ? "text-destructive" : isExpiring ? "text-amber-700" : "text-foreground"}`}
          >
            {formatDateDisplay(batch.expiryDate)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Buy Price</p>
          <p className="font-semibold text-foreground">
            ₹{batch.purchasePrice.toFixed(2)}
          </p>
        </div>
      </div>

      {editing && (
        <EditBatchForm
          batch={batch}
          drugId={drugId}
          onDone={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ── Drug Detail Modal (inline view) ─────────────────────────────────────────

interface DrugDetailModalProps {
  drugId: bigint;
  onBack: () => void;
}

export function DrugDetailModal({ drugId, onBack }: DrugDetailModalProps) {
  const { data, isLoading } = useGetDrug(drugId);
  const deleteDrug = useDeleteDrug();
  const [editingDrug, setEditingDrug] = useState(false);

  const handleDeleteDrug = async () => {
    if (
      !confirm("Delete this drug and all its batches? This cannot be undone.")
    )
      return;
    try {
      await deleteDrug.mutateAsync(drugId);
      toast.success("Drug deleted");
      onBack();
    } catch {
      toast.error("Failed to delete drug");
    }
  };

  const drug = data?.drug;
  const batches = data?.batches ?? [];
  const totalQty = batches.reduce((sum, b) => sum + Number(b.quantity), 0);
  const status = getStockStatus(batches);
  const badge = getStatusMeta(status);

  const expiredCount = batches.filter(
    (b) => Number(b.expiryDate) / 1_000_000 < Date.now(),
  ).length;
  const expiringCount = batches.filter((b) => {
    const diff = Number(b.expiryDate) / 1_000_000 - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="px-4 py-4 space-y-4" data-ocid="drug-detail">
      {/* Header bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to inventory"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display font-bold text-foreground text-lg truncate flex-1 min-w-0">
          {drug?.name ?? "Drug Details"}
        </h2>
        <button
          type="button"
          onClick={handleDeleteDrug}
          data-ocid="delete-drug-btn"
          aria-label="Delete drug"
          className="w-9 h-9 flex items-center justify-center rounded-full text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isLoading || !drug ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Drug info card */}
          {editingDrug ? (
            <EditDrugForm drug={drug} onDone={() => setEditingDrug(false)} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-foreground text-xl leading-tight truncate">
                    {drug.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {drug.manufacturer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDrug(true)}
                  data-ocid="edit-drug-btn"
                  aria-label="Edit drug info"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {drug.description && (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {drug.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Sale Price</p>
                  <p className="font-semibold text-sm text-foreground">
                    ₹{drug.salePrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Stock</p>
                  <p className="font-bold text-sm text-foreground">
                    {totalQty} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`stock-indicator ${badge.dot}`} />
                    <span className={`text-xs ${badge.label}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              </div>

              {(expiredCount > 0 || expiringCount > 0) && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 flex-shrink-0"
                  />
                  <p className="text-xs text-amber-800">
                    {expiredCount > 0 &&
                      `${expiredCount} batch${expiredCount > 1 ? "es" : ""} expired`}
                    {expiredCount > 0 && expiringCount > 0 && " · "}
                    {expiringCount > 0 && `${expiringCount} expiring soon`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Batches section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-muted-foreground" />
                <h4 className="font-display font-semibold text-sm text-foreground">
                  Batches ({batches.length})
                </h4>
              </div>
            </div>

            {batches.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 gap-2 bg-card rounded-lg border border-border"
                data-ocid="batches-empty"
              >
                <Package size={24} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No batches recorded
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Add a batch from the Add Drug tab
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {batches.map((batch) => (
                  <BatchRow
                    key={batch.id.toString()}
                    batch={batch}
                    drugId={drug.id}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
