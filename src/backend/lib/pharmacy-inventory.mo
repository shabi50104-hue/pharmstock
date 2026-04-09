import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/pharmacy-inventory";

module {
  // ── Drug CRUD ──────────────────────────────────────────────────────────────

  public func createDrug(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    nextId : Nat,
    input : Types.DrugInput,
    now : Types.Timestamp,
  ) : Types.Drug {
    let drug : Types.Drug = {
      id = nextId;
      name = input.name;
      manufacturer = input.manufacturer;
      description = input.description;
      salePrice = input.salePrice;
      createdAt = now;
      updatedAt = now;
    };
    drugs.add(nextId, drug);
    drug;
  };

  public func updateDrug(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    id : Types.DrugId,
    input : Types.DrugInput,
    now : Types.Timestamp,
  ) : Types.Drug {
    let existing = switch (drugs.get(id)) {
      case (?d) d;
      case null Runtime.trap("Drug not found");
    };
    let updated : Types.Drug = {
      existing with
      name = input.name;
      manufacturer = input.manufacturer;
      description = input.description;
      salePrice = input.salePrice;
      updatedAt = now;
    };
    drugs.add(id, updated);
    updated;
  };

  public func deleteDrug(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    batches : Map.Map<Types.BatchId, Types.Batch>,
    id : Types.DrugId,
  ) {
    switch (drugs.get(id)) {
      case null Runtime.trap("Drug not found");
      case (?_) {};
    };
    drugs.remove(id);
    // Remove all batches belonging to this drug
    let toDelete = (
      batches.entries()
        |> _.filter(func((_, b) : (Types.BatchId, Types.Batch)) : Bool {
          b.drugId == id
        })
        |> _.map(func((k, _) : (Types.BatchId, Types.Batch)) : Types.BatchId { k })
    ).toArray();
    for (batchId in toDelete.values()) {
      batches.remove(batchId);
    };
  };

  public func getDrug(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    id : Types.DrugId,
  ) : ?Types.Drug {
    drugs.get(id);
  };

  public func listDrugs(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    batches : Map.Map<Types.BatchId, Types.Batch>,
    search : ?Text,
  ) : [Types.DrugWithBatches] {
    let allBatches = batches.values().toArray();
    (
      drugs.values()
        |> _.filter(func(drug : Types.Drug) : Bool {
          switch (search) {
            case null true;
            case (?term) {
              let lower = term.toLower();
              drug.name.toLower().contains(#text lower)
                or drug.manufacturer.toLower().contains(#text lower);
            };
          };
        })
        |> _.map(func(drug : Types.Drug) : Types.DrugWithBatches {
          let drugBatches = allBatches.filter(
            func(b) { b.drugId == drug.id },
          );
          { drug; batches = drugBatches };
        })
    ).toArray();
  };

  // ── Batch CRUD ─────────────────────────────────────────────────────────────

  public func createBatch(
    batches : Map.Map<Types.BatchId, Types.Batch>,
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    nextId : Nat,
    input : Types.BatchInput,
    now : Types.Timestamp,
  ) : Types.Batch {
    switch (drugs.get(input.drugId)) {
      case null Runtime.trap("Drug not found");
      case (?_) {};
    };
    let batch : Types.Batch = {
      id = nextId;
      drugId = input.drugId;
      batchNumber = input.batchNumber;
      quantity = input.quantity;
      expiryDate = input.expiryDate;
      purchasePrice = input.purchasePrice;
      manufacturedDate = input.manufacturedDate;
      createdAt = now;
    };
    batches.add(nextId, batch);
    batch;
  };

  public func updateBatch(
    batches : Map.Map<Types.BatchId, Types.Batch>,
    batchId : Types.BatchId,
    input : Types.BatchInput,
    _now : Types.Timestamp,
  ) : Types.Batch {
    let existing = switch (batches.get(batchId)) {
      case (?b) b;
      case null Runtime.trap("Batch not found");
    };
    let updated : Types.Batch = {
      existing with
      batchNumber = input.batchNumber;
      quantity = input.quantity;
      expiryDate = input.expiryDate;
      purchasePrice = input.purchasePrice;
      manufacturedDate = input.manufacturedDate;
    };
    batches.add(batchId, updated);
    updated;
  };

  public func deleteBatch(
    batches : Map.Map<Types.BatchId, Types.Batch>,
    id : Types.BatchId,
  ) {
    switch (batches.get(id)) {
      case null Runtime.trap("Batch not found");
      case (?_) {};
    };
    batches.remove(id);
  };

  public func dispenseBatch(
    batches : Map.Map<Types.BatchId, Types.Batch>,
    input : Types.DispenseInput,
  ) {
    let batch = switch (batches.get(input.batchId)) {
      case (?b) b;
      case null Runtime.trap("Batch not found");
    };
    if (batch.quantity < input.quantity) {
      Runtime.trap("Insufficient stock");
    };
    let updated : Types.Batch = { batch with quantity = batch.quantity - input.quantity };
    batches.add(input.batchId, updated);
  };

  public func getBatchesForDrug(
    batches : Map.Map<Types.BatchId, Types.Batch>,
    drugId : Types.DrugId,
  ) : [Types.Batch] {
    (
      batches.values()
        |> _.filter(func(b : Types.Batch) : Bool { b.drugId == drugId })
    ).toArray();
  };

  // ── Bill / OCR ─────────────────────────────────────────────────────────────

  public func createBill(
    bills : Map.Map<Types.BillId, Types.Bill>,
    nextId : Nat,
    input : Types.BillInput,
    now : Types.Timestamp,
  ) : Types.Bill {
    let bill : Types.Bill = {
      id = nextId;
      filename = input.filename;
      image = input.image;
      extractedText = null;
      uploadedAt = now;
      note = input.note;
    };
    bills.add(nextId, bill);
    bill;
  };

  public func updateBillExtractedText(
    bills : Map.Map<Types.BillId, Types.Bill>,
    billId : Types.BillId,
    text : Text,
  ) {
    let bill = switch (bills.get(billId)) {
      case (?b) b;
      case null Runtime.trap("Bill not found");
    };
    let updated : Types.Bill = { bill with extractedText = ?text };
    bills.add(billId, updated);
  };

  public func listBills(
    bills : Map.Map<Types.BillId, Types.Bill>,
  ) : [Types.Bill] {
    // Return bills sorted most-recent first (highest id = most recent)
    let arr = bills.values().toArray();
    arr.sort<Types.Bill>(func(a, b) {
      if (a.uploadedAt > b.uploadedAt) #less
      else if (a.uploadedAt < b.uploadedAt) #greater
      else #equal
    });
  };

  public func deleteBill(
    bills : Map.Map<Types.BillId, Types.Bill>,
    id : Types.BillId,
  ) {
    switch (bills.get(id)) {
      case null Runtime.trap("Bill not found");
      case (?_) {};
    };
    bills.remove(id);
  };

  // ── Alerts ─────────────────────────────────────────────────────────────────

  public func getExpiryAlerts(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    batches : Map.Map<Types.BatchId, Types.Batch>,
    dismissedAlerts : Set.Set<Types.BatchId>,
    withinDays : Nat,
    now : Types.Timestamp,
  ) : [Types.ExpiryAlert] {
    // Convert days to nanoseconds: days * 24 * 60 * 60 * 1_000_000_000
    let windowNs : Int = withinDays.toInt() * 24 * 60 * 60 * 1_000_000_000;
    let deadline : Int = now + windowNs;
    (
      batches.values()
        |> _.filter(func(b : Types.Batch) : Bool {
          b.expiryDate <= deadline and b.quantity > 0
        })
        |> _.map(func(b : Types.Batch) : Types.ExpiryAlert {
          let drugName = switch (drugs.get(b.drugId)) {
            case (?d) d.name;
            case null "Unknown";
          };
          {
            batchId = b.id;
            drugId = b.drugId;
            drugName;
            batchNumber = b.batchNumber;
            expiryDate = b.expiryDate;
            quantity = b.quantity;
            dismissed = dismissedAlerts.contains(b.id);
          };
        })
    ).toArray();
  };

  // ── Dashboard ──────────────────────────────────────────────────────────────

  public func getDashboardStats(
    drugs : Map.Map<Types.DrugId, Types.Drug>,
    batches : Map.Map<Types.BatchId, Types.Batch>,
    dismissedAlerts : Set.Set<Types.BatchId>,
    now : Types.Timestamp,
  ) : Types.DashboardStats {
    let lowStockThreshold = 10;
    // 30 days in nanoseconds
    let thirtyDaysNs : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
    let deadline : Int = now + thirtyDaysNs;

    var lowStockCount : Nat = 0;
    var expiringSoonCount : Nat = 0;

    for ((_, b) in batches.entries()) {
      if (b.quantity < lowStockThreshold) {
        lowStockCount += 1;
      };
      if (
        b.expiryDate <= deadline
          and b.quantity > 0
          and not dismissedAlerts.contains(b.id)
      ) {
        expiringSoonCount += 1;
      };
    };

    {
      totalDrugs = drugs.size();
      totalBatches = batches.size();
      lowStockBatchCount = lowStockCount;
      expiringSoonCount;
    };
  };
};
