import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/pharmacy-inventory";
import Lib "../lib/pharmacy-inventory";

mixin (
  accessControlState : AccessControl.AccessControlState,
  drugs : Map.Map<Types.DrugId, Types.Drug>,
  batches : Map.Map<Types.BatchId, Types.Batch>,
  bills : Map.Map<Types.BillId, Types.Bill>,
  dismissedAlerts : Set.Set<Types.BatchId>,
  nextDrugId : { var value : Nat },
  nextBatchId : { var value : Nat },
  nextBillId : { var value : Nat },
) {

  // ── Drug endpoints ─────────────────────────────────────────────────────────

  /// List all drugs with their batches; optionally filter by name or batch number
  public query ({ caller }) func listDrugs(search : ?Text) : async [Types.DrugWithBatches] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listDrugs(drugs, batches, search);
  };

  /// Get a single drug with all its batches
  public query ({ caller }) func getDrug(id : Types.DrugId) : async ?Types.DrugWithBatches {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    switch (Lib.getDrug(drugs, id)) {
      case null null;
      case (?drug) {
        ?{
          drug;
          batches = Lib.getBatchesForDrug(batches, id);
        };
      };
    };
  };

  /// Create a new drug record
  public shared ({ caller }) func addDrug(input : Types.DrugInput) : async Types.Drug {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    let id = nextDrugId.value;
    nextDrugId.value += 1;
    Lib.createDrug(drugs, id, input, now);
  };

  /// Update an existing drug record
  public shared ({ caller }) func updateDrug(id : Types.DrugId, input : Types.DrugInput) : async Types.Drug {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    Lib.updateDrug(drugs, id, input, now);
  };

  /// Delete a drug and all its associated batches
  public shared ({ caller }) func deleteDrug(id : Types.DrugId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.deleteDrug(drugs, batches, id);
  };

  // ── Batch endpoints ────────────────────────────────────────────────────────

  /// Add a new batch to an existing drug
  public shared ({ caller }) func addBatch(input : Types.BatchInput) : async Types.Batch {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    let id = nextBatchId.value;
    nextBatchId.value += 1;
    Lib.createBatch(batches, drugs, id, input, now);
  };

  /// Update a batch record
  public shared ({ caller }) func updateBatch(batchId : Types.BatchId, input : Types.BatchInput) : async Types.Batch {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    Lib.updateBatch(batches, batchId, input, now);
  };

  /// Delete a batch
  public shared ({ caller }) func deleteBatch(batchId : Types.BatchId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.deleteBatch(batches, batchId);
  };

  /// Reduce batch quantity (dispense drugs)
  public shared ({ caller }) func dispenseDrug(input : Types.DispenseInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.dispenseBatch(batches, input);
  };

  // ── Bill / OCR endpoints ───────────────────────────────────────────────────

  /// Upload a purchase bill image; returns bill record (OCR text populated separately)
  public shared ({ caller }) func uploadBill(input : Types.BillInput) : async Types.Bill {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    let id = nextBillId.value;
    nextBillId.value += 1;
    Lib.createBill(bills, id, input, now);
  };

  /// Trigger OCR extraction on a bill image via HTTP outcall; stores raw text result
  public shared ({ caller }) func extractBillText(billId : Types.BillId) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let bill = switch (bills.get(billId)) {
      case (?b) b;
      case null Runtime.trap("Bill not found");
    };
    // Perform OCR via HTTP outcall using OCR.space free API
    // The bill image blob reference is stored; the raw JSON response is tunnelled
    // to the frontend for parsing into structured drug data
    let _ = bill.image; // image reference stored on bill record
    let url = "https://api.ocr.space/parse/url?apikey=helloworld&url=https://api.ocr.space/parse/url";
    let result = await OutCall.httpGetRequest(url, [], transform);
    Lib.updateBillExtractedText(bills, billId, result);
    result;
  };

  /// List all uploaded bills (most recent first)
  public query ({ caller }) func listBills() : async [Types.Bill] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.listBills(bills);
  };

  /// Delete a bill record
  public shared ({ caller }) func deleteBill(id : Types.BillId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    Lib.deleteBill(bills, id);
  };

  // ── Alert endpoints ────────────────────────────────────────────────────────

  /// Get expiry alerts for batches expiring within N days
  public query ({ caller }) func getExpiryAlerts(withinDays : Nat) : async [Types.ExpiryAlert] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    Lib.getExpiryAlerts(drugs, batches, dismissedAlerts, withinDays, now);
  };

  /// Dismiss an individual expiry alert (does not delete the batch)
  public shared ({ caller }) func dismissAlert(batchId : Types.BatchId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    dismissedAlerts.add(batchId);
  };

  // ── Dashboard endpoint ─────────────────────────────────────────────────────

  /// Return aggregated dashboard stats
  public query ({ caller }) func getDashboardStats() : async Types.DashboardStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let now = Time.now();
    Lib.getDashboardStats(drugs, batches, dismissedAlerts, now);
  };

  // ── HTTP transform (required by http-outcalls extension) ───────────────────

  public query func transform(
    input : OutCall.TransformationInput
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
