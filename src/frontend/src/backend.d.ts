import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Drug {
    id: DrugId;
    manufacturer: string;
    name: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    salePrice: number;
}
export interface DispenseInput {
    quantity: bigint;
    batchId: BatchId;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type DrugId = bigint;
export interface BillInput {
    note: string;
    filename: string;
    image: ExternalBlob;
}
export type BillId = bigint;
export interface DashboardStats {
    lowStockBatchCount: bigint;
    totalBatches: bigint;
    totalDrugs: bigint;
    expiringSoonCount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type BatchId = bigint;
export interface BatchInput {
    purchasePrice: number;
    expiryDate: Timestamp;
    manufacturedDate?: Timestamp;
    batchNumber: string;
    quantity: bigint;
    drugId: DrugId;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Bill {
    id: BillId;
    note: string;
    extractedText?: string;
    filename: string;
    image: ExternalBlob;
    uploadedAt: Timestamp;
}
export interface Batch {
    id: BatchId;
    purchasePrice: number;
    expiryDate: Timestamp;
    createdAt: Timestamp;
    manufacturedDate?: Timestamp;
    batchNumber: string;
    quantity: bigint;
    drugId: DrugId;
}
export interface ExpiryAlert {
    drugName: string;
    expiryDate: Timestamp;
    batchNumber: string;
    quantity: bigint;
    batchId: BatchId;
    dismissed: boolean;
    drugId: DrugId;
}
export interface DrugWithBatches {
    drug: Drug;
    batches: Array<Batch>;
}
export interface DrugInput {
    manufacturer: string;
    name: string;
    description: string;
    salePrice: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBatch(input: BatchInput): Promise<Batch>;
    addDrug(input: DrugInput): Promise<Drug>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBatch(batchId: BatchId): Promise<void>;
    deleteBill(id: BillId): Promise<void>;
    deleteDrug(id: DrugId): Promise<void>;
    dismissAlert(batchId: BatchId): Promise<void>;
    dispenseDrug(input: DispenseInput): Promise<void>;
    extractBillText(billId: BillId): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getDrug(id: DrugId): Promise<DrugWithBatches | null>;
    getExpiryAlerts(withinDays: bigint): Promise<Array<ExpiryAlert>>;
    isCallerAdmin(): Promise<boolean>;
    listBills(): Promise<Array<Bill>>;
    listDrugs(search: string | null): Promise<Array<DrugWithBatches>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBatch(batchId: BatchId, input: BatchInput): Promise<Batch>;
    updateDrug(id: DrugId, input: DrugInput): Promise<Drug>;
    uploadBill(input: BillInput): Promise<Bill>;
}
