import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { DrugCard } from "../components/DrugCard";
import { DrugDetailModal } from "../components/DrugDetailModal";
import { useListDrugs } from "../hooks/useInventory";
import type { StockStatus } from "../types";

type SortOption = "name" | "expiry" | "quantity" | "status";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "expiry", label: "Expiry" },
  { value: "quantity", label: "Quantity" },
  { value: "status", label: "Status" },
];

const STATUS_ORDER: Record<StockStatus, number> = {
  expired: 0,
  expiring: 1,
  low: 2,
  healthy: 3,
};

function getEarliestExpiry(batches: { expiryDate: bigint }[]): number {
  if (batches.length === 0) return Number.MAX_SAFE_INTEGER;
  return Math.min(...batches.map((b) => Number(b.expiryDate) / 1_000_000));
}

function getStockStatusForSort(
  batches: { quantity: bigint; expiryDate: bigint }[],
): StockStatus {
  if (batches.length === 0) return "low";
  const now = Date.now();
  const hasExpired = batches.some(
    (b) => Number(b.expiryDate) / 1_000_000 < now,
  );
  if (hasExpired) return "expired";
  const hasExpiring = batches.some((b) => {
    const diff = Number(b.expiryDate) / 1_000_000 - now;
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });
  if (hasExpiring) return "expiring";
  const total = batches.reduce((s, b) => s + Number(b.quantity), 0);
  if (total < 20) return "low";
  return "healthy";
}

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showSort, setShowSort] = useState(false);

  const { data: drugs, isLoading } = useListDrugs(search || null);

  if (selectedId !== null) {
    return (
      <DrugDetailModal drugId={selectedId} onBack={() => setSelectedId(null)} />
    );
  }

  const sorted = drugs
    ? [...drugs].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.drug.name.localeCompare(b.drug.name);
          case "expiry":
            return getEarliestExpiry(a.batches) - getEarliestExpiry(b.batches);
          case "quantity": {
            const qA = a.batches.reduce((s, bb) => s + Number(bb.quantity), 0);
            const qB = b.batches.reduce((s, bb) => s + Number(bb.quantity), 0);
            return qA - qB;
          }
          case "status":
            return (
              STATUS_ORDER[getStockStatusForSort(a.batches)] -
              STATUS_ORDER[getStockStatusForSort(b.batches)]
            );
          default:
            return 0;
        }
      })
    : [];

  const totalDrugs = sorted.length;
  const alertCount = sorted.filter((d) => {
    const s = getStockStatusForSort(d.batches);
    return s === "expired" || s === "expiring";
  }).length;

  return (
    <div className="px-4 py-4 space-y-4" data-ocid="inventory-page">
      {/* Search + sort bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search drugs by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="inventory-search"
            className="pl-9 bg-card border-border h-10 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowSort((v) => !v)}
          aria-label="Sort inventory"
          data-ocid="inventory-sort-toggle"
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors flex-shrink-0 ${showSort ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Sort pills */}
      {showSort && (
        <div className="flex gap-2 flex-wrap" data-ocid="sort-options">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setSortBy(opt.value);
                setShowSort(false);
              }}
              data-ocid={`sort-${opt.value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${sortBy === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Summary row */}
      {!isLoading && sorted.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <span>
            {totalDrugs} drug{totalDrugs !== 1 ? "s" : ""} in inventory
          </span>
          {alertCount > 0 && (
            <span className="text-destructive font-medium">
              {alertCount} need{alertCount === 1 ? "s" : ""} attention
            </span>
          )}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          data-ocid="inventory-empty"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Pill size={28} className="text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground text-base">
            {search ? "No results found" : "No drugs in inventory"}
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
            {search
              ? `No drugs match "${search}". Try a different search term.`
              : "Add your first drug using the Add Drug tab below."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <DrugCard
              key={item.drug.id.toString()}
              item={item}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
