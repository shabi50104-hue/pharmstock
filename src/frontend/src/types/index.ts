export type {
  Drug,
  DrugId,
  DrugInput,
  DrugWithBatches,
  Batch,
  BatchId,
  BatchInput,
  Bill,
  BillId,
  BillInput,
  DashboardStats,
  ExpiryAlert,
  Timestamp,
  UserRole,
  DispenseInput,
} from "../backend";

export type StockStatus = "healthy" | "low" | "expiring" | "expired";

export interface DrugCardData {
  drugId: bigint;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: bigint;
  quantity: bigint;
  status: StockStatus;
}

export type TabRoute =
  | "dashboard"
  | "inventory"
  | "add"
  | "alerts"
  | "settings";
