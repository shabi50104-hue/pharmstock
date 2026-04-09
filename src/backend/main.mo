import Map "mo:core/Map";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Types "types/pharmacy-inventory";
import PharmacyApi "mixins/pharmacy-inventory-api";

actor {
  // ── Authorization ──────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object storage (for bill images) ──────────────────────────────────────
  include MixinObjectStorage();

  // ── Pharmacy inventory state ───────────────────────────────────────────────
  let drugs = Map.empty<Types.DrugId, Types.Drug>();
  let batches = Map.empty<Types.BatchId, Types.Batch>();
  let bills = Map.empty<Types.BillId, Types.Bill>();
  let dismissedAlerts = Set.empty<Types.BatchId>();

  let nextDrugId = { var value : Nat = 0 };
  let nextBatchId = { var value : Nat = 0 };
  let nextBillId = { var value : Nat = 0 };

  include PharmacyApi(
    accessControlState,
    drugs,
    batches,
    bills,
    dismissedAlerts,
    nextDrugId,
    nextBatchId,
    nextBillId,
  );
};
