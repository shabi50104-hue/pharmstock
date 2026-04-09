import CommonTypes "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type Timestamp = CommonTypes.Timestamp;
  public type DrugId = CommonTypes.DrugId;
  public type BatchId = CommonTypes.BatchId;
  public type BillId = CommonTypes.BillId;

  // A single batch of a drug with its own expiry, quantity, and purchase info
  public type Batch = {
    id : BatchId;
    drugId : DrugId;
    batchNumber : Text;
    quantity : Nat;
    expiryDate : Timestamp; // nanoseconds
    purchasePrice : Float;
    manufacturedDate : ?Timestamp;
    createdAt : Timestamp;
  };

  // Core drug record — one entry per drug product
  public type Drug = {
    id : DrugId;
    name : Text;
    manufacturer : Text;
    description : Text;
    salePrice : Float;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Input type for creating/updating a drug
  public type DrugInput = {
    name : Text;
    manufacturer : Text;
    description : Text;
    salePrice : Float;
  };

  // Input for adding a batch
  public type BatchInput = {
    drugId : DrugId;
    batchNumber : Text;
    quantity : Nat;
    expiryDate : Timestamp;
    purchasePrice : Float;
    manufacturedDate : ?Timestamp;
  };

  // Input for dispensing (reducing) stock on a batch
  public type DispenseInput = {
    batchId : BatchId;
    quantity : Nat;
  };

  // An uploaded purchase bill/image with extracted drug data
  public type Bill = {
    id : BillId;
    filename : Text;
    image : Storage.ExternalBlob;
    extractedText : ?Text; // raw OCR result from http-outcall
    uploadedAt : Timestamp;
    note : Text;
  };

  // Input for saving a bill
  public type BillInput = {
    filename : Text;
    image : Storage.ExternalBlob;
    note : Text;
  };

  // Alert for near-expiry drugs (dismissable per batch)
  public type ExpiryAlert = {
    batchId : BatchId;
    drugId : DrugId;
    drugName : Text;
    batchNumber : Text;
    expiryDate : Timestamp;
    quantity : Nat;
    dismissed : Bool;
  };

  // Dashboard aggregated stats
  public type DashboardStats = {
    totalDrugs : Nat;
    totalBatches : Nat;
    lowStockBatchCount : Nat;   // batches with quantity < 10
    expiringSoonCount : Nat;    // batches expiring within 30 days (non-dismissed)
  };

  // Combined drug + its batches view
  public type DrugWithBatches = {
    drug : Drug;
    batches : [Batch];
  };
};
