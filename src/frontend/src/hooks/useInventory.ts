import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  BatchId,
  BatchInput,
  BillId,
  BillInput,
  DispenseInput,
  DrugId,
  DrugInput,
} from "../types";

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useListDrugs(search: string | null = null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["drugs", search],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDrugs(search);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDrug(id: DrugId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["drug", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getDrug(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useExpiryAlerts(withinDays = 30) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["expiryAlerts", withinDays],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpiryAlerts(BigInt(withinDays));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useListBills() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDrug() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DrugInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addDrug(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateDrug() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: DrugId; input: DrugInput }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateDrug(id, input);
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["drug", id.toString()] });
    },
  });
}

export function useDeleteDrug() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: DrugId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDrug(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAddBatch() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BatchInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addBatch(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["expiryAlerts"] });
    },
  });
}

export function useUpdateBatch() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      batchId,
      input,
    }: { batchId: BatchId; input: BatchInput }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateBatch(batchId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["expiryAlerts"] });
    },
  });
}

export function useDeleteBatch() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: BatchId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteBatch(batchId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["expiryAlerts"] });
    },
  });
}

export function useDispenseDrug() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DispenseInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.dispenseDrug(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDismissAlert() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: BatchId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.dismissAlert(batchId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expiryAlerts"] });
    },
  });
}

export function useUploadBill() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BillInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.uploadBill(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useExtractBillText() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (billId: BillId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.extractBillText(billId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useDeleteBill() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: BillId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteBill(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}
