import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  categoryId: z.string(),
  addCount: z.number().default(0),
});

export type Product = z.infer<typeof productSchema>;

export const insertProductSchema = productSchema.omit({ id: true, addCount: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Category Schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

export const insertCategorySchema = categorySchema.omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Bill Item Schema
export const billItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number().positive(),
  total: z.number(),
});

export type BillItem = z.infer<typeof billItemSchema>;

// Bill Schema
export const billSchema = z.object({
  id: z.string(),
  dateISO: z.string(),
  items: z.array(billItemSchema),
  subtotal: z.number(),
  discount: z.number().default(0),
  gst: z.number().default(0),
  total: z.number(),
  token: z.number().optional(),
  paymentMode: z.enum(['cash', 'online', 'both']).default('cash'),
  onlineAmount: z.number().default(0),
  cashAmount: z.number().default(0),
});

export type Bill = z.infer<typeof billSchema>;

export const insertBillSchema = billSchema.omit({ id: true });
export type InsertBill = z.infer<typeof insertBillSchema>;

// Settings Schema
export const settingsSchema = z.object({
  shopName: z.string().default("My Shop"),
  address: z.string().default(""),
  gstOn: z.boolean().default(false),
  gstPercent: z.number().min(0).max(100).default(18),
  tokenVisible: z.boolean().default(true),
  printLayout: z.enum(["A4", "58mm", "80mm"]).default("80mm"),
});

export type Settings = z.infer<typeof settingsSchema>;

// Token Counter Schema
export const tokenCounterSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  count: z.number().default(0),
});

export type TokenCounter = z.infer<typeof tokenCounterSchema>;

// Encrypted Blob Schema (for localStorage)
export const encryptedBlobSchema = z.object({
  ct: z.string(), // base64 ciphertext
  iv: z.string(), // base64 IV
  ts: z.string(), // ISO timestamp
});

export type EncryptedBlob = z.infer<typeof encryptedBlobSchema>;
