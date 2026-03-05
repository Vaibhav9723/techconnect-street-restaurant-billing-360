import { useEncryptedStorage } from "@/hooks/useEncryptedStorage";
import { BillItem } from "@/types/schema";

export type RunningCarts = {
  takeaway: BillItem[];
  tables: Record<string, BillItem[]>

};

const defaultValue: RunningCarts = {
  takeaway: [],
  tables: {
    T1: [],
    T2: [],
    T3: [],
    T4: [],
  },
};

export function useRunningCarts() {
  return useEncryptedStorage<RunningCarts>(
    "RUNNING_CARTS",
    defaultValue
  );
}
