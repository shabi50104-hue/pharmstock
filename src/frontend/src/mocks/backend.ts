import type { backendInterface, ExternalBlob } from "../backend";
import { UserRole } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const msToNs = (ms: number) => BigInt(ms) * BigInt(1_000_000);

// Some drug batches expire soon, one already expired
const expiredDate = msToNs(Date.now() - 30 * 24 * 60 * 60 * 1000);
const expiringSoonDate = msToNs(Date.now() + 20 * 24 * 60 * 60 * 1000);
const safeDate = msToNs(Date.now() + 365 * 24 * 60 * 60 * 1000);

export const mockBackend: backendInterface = {
  _immutableObjectStorageBlobsAreLive: async (hashes) => hashes.map(() => true),
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async (blobHash) => ({ method: "PUT", blob_hash: blobHash }),
  _immutableObjectStorageRefillCashier: async () => ({ success: true, topped_up_amount: BigInt(0) }),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,

  addBatch: async () => ({
    id: BigInt(10),
    purchasePrice: 10.0,
    expiryDate: safeDate,
    createdAt: now,
    batchNumber: "B99999",
    quantity: BigInt(100),
    drugId: BigInt(1),
  }),

  addDrug: async (input) => ({
    id: BigInt(10),
    manufacturer: input.manufacturer,
    name: input.name,
    createdAt: now,
    description: input.description,
    updatedAt: now,
    salePrice: input.salePrice,
  }),

  assignCallerUserRole: async () => undefined,

  deleteBatch: async () => undefined,
  deleteBill: async () => undefined,
  deleteDrug: async () => undefined,
  dismissAlert: async () => undefined,
  dispenseDrug: async () => undefined,

  extractBillText: async () =>
    "INVOICE #2024-001\nDate: 15 Jan 2024\n\nParacetamol 500mg x 200 units @ $0.50\nAmoxicillin 250mg x 50 units @ $1.20\nLisinopril 10mg x 100 units @ $0.80\n\nTotal: $260.00",

  getCallerUserRole: async () => UserRole.admin,

  getDashboardStats: async () => ({
    lowStockBatchCount: BigInt(2),
    totalBatches: BigInt(8),
    totalDrugs: BigInt(6),
    expiringSoonCount: BigInt(4),
  }),

  getDrug: async () => ({
    drug: {
      id: BigInt(1),
      manufacturer: "PharmaLab",
      name: "Paracetamol 500mg",
      createdAt: now,
      description: "Pain reliever and fever reducer",
      updatedAt: now,
      salePrice: 0.5,
    },
    batches: [
      {
        id: BigInt(1),
        purchasePrice: 0.35,
        expiryDate: safeDate,
        createdAt: now,
        batchNumber: "B00147",
        quantity: BigInt(520),
        drugId: BigInt(1),
      },
    ],
  }),

  getExpiryAlerts: async () => [
    {
      drugName: "Amoxicillin 250mg",
      expiryDate: expiredDate,
      batchNumber: "B99831",
      quantity: BigInt(15),
      batchId: BigInt(2),
      dismissed: false,
      drugId: BigInt(2),
    },
    {
      drugName: "Lisinopril 10mg",
      expiryDate: expiringSoonDate,
      batchNumber: "B77402",
      quantity: BigInt(340),
      batchId: BigInt(3),
      dismissed: false,
      drugId: BigInt(3),
    },
    {
      drugName: "Metformin 500mg",
      expiryDate: expiringSoonDate,
      batchNumber: "B55123",
      quantity: BigInt(200),
      batchId: BigInt(4),
      dismissed: false,
      drugId: BigInt(4),
    },
    {
      drugName: "Aspirin 100mg",
      expiryDate: expiredDate,
      batchNumber: "B44221",
      quantity: BigInt(50),
      batchId: BigInt(5),
      dismissed: false,
      drugId: BigInt(5),
    },
  ],

  isCallerAdmin: async () => true,

  listBills: async () => [
    {
      id: BigInt(1),
      note: "January restock",
      extractedText: "INVOICE #2024-001\nParacetamol 500mg x 200 units\nAmoxicillin 250mg x 50 units",
      filename: "invoice_jan_2024.jpg",
      image: { getBytes: async () => new Uint8Array(), getDirectURL: () => "", withUploadProgress: function() { return this; } } as unknown as ExternalBlob,
      uploadedAt: now,
    },
  ],

  listDrugs: async () => [
    {
      drug: {
        id: BigInt(1),
        manufacturer: "PharmaLab",
        name: "Paracetamol 500mg",
        createdAt: now,
        description: "Pain reliever and fever reducer",
        updatedAt: now,
        salePrice: 0.5,
      },
      batches: [
        {
          id: BigInt(1),
          purchasePrice: 0.35,
          expiryDate: safeDate,
          createdAt: now,
          batchNumber: "B00147",
          quantity: BigInt(520),
          drugId: BigInt(1),
        },
      ],
    },
    {
      drug: {
        id: BigInt(2),
        manufacturer: "MediCorp",
        name: "Amoxicillin 250mg",
        createdAt: now,
        description: "Antibiotic for bacterial infections",
        updatedAt: now,
        salePrice: 1.2,
      },
      batches: [
        {
          id: BigInt(2),
          purchasePrice: 0.9,
          expiryDate: expiredDate,
          createdAt: now,
          batchNumber: "B99831",
          quantity: BigInt(15),
          drugId: BigInt(2),
        },
      ],
    },
    {
      drug: {
        id: BigInt(3),
        manufacturer: "CardioPharm",
        name: "Lisinopril 10mg",
        createdAt: now,
        description: "ACE inhibitor for blood pressure",
        updatedAt: now,
        salePrice: 0.8,
      },
      batches: [
        {
          id: BigInt(3),
          purchasePrice: 0.6,
          expiryDate: expiringSoonDate,
          createdAt: now,
          batchNumber: "B77402",
          quantity: BigInt(340),
          drugId: BigInt(3),
        },
      ],
    },
    {
      drug: {
        id: BigInt(4),
        manufacturer: "DiabCare",
        name: "Metformin 500mg",
        createdAt: now,
        description: "Oral diabetes medication",
        updatedAt: now,
        salePrice: 0.6,
      },
      batches: [
        {
          id: BigInt(4),
          purchasePrice: 0.45,
          expiryDate: expiringSoonDate,
          createdAt: now,
          batchNumber: "B55123",
          quantity: BigInt(200),
          drugId: BigInt(4),
        },
      ],
    },
    {
      drug: {
        id: BigInt(5),
        manufacturer: "HeartCare",
        name: "Aspirin 100mg",
        createdAt: now,
        description: "Blood thinner and pain reliever",
        updatedAt: now,
        salePrice: 0.3,
      },
      batches: [
        {
          id: BigInt(5),
          purchasePrice: 0.2,
          expiryDate: expiredDate,
          createdAt: now,
          batchNumber: "B44221",
          quantity: BigInt(50),
          drugId: BigInt(5),
        },
      ],
    },
    {
      drug: {
        id: BigInt(6),
        manufacturer: "VitaPharm",
        name: "Vitamin D3 1000IU",
        createdAt: now,
        description: "Vitamin D supplement",
        updatedAt: now,
        salePrice: 0.4,
      },
      batches: [
        {
          id: BigInt(6),
          purchasePrice: 0.25,
          expiryDate: safeDate,
          createdAt: now,
          batchNumber: "B33110",
          quantity: BigInt(750),
          drugId: BigInt(6),
        },
      ],
    },
  ],

  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: [],
  }),

  updateBatch: async (batchId, input) => ({
    id: batchId,
    purchasePrice: input.purchasePrice,
    expiryDate: input.expiryDate,
    createdAt: now,
    batchNumber: input.batchNumber,
    quantity: input.quantity,
    drugId: input.drugId,
  }),

  updateDrug: async (id, input) => ({
    id,
    manufacturer: input.manufacturer,
    name: input.name,
    createdAt: now,
    description: input.description,
    updatedAt: now,
    salePrice: input.salePrice,
  }),

  uploadBill: async (input) => ({
    id: BigInt(2),
    note: input.note,
    filename: input.filename,
    image: input.image,
    uploadedAt: now,
  }),
};
