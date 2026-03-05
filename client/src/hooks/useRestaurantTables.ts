import { useEncryptedStorage } from "@/hooks/useEncryptedStorage";

export type RestaurantTable = {
  id: string;
  name: string;
}; 

const DEFAULT_TABLES: RestaurantTable[] = [
  { id: "T1", name: "Table 1" },
  { id: "T2", name: "Table 2" },
];

export function useRestaurantTables() {
  return useEncryptedStorage<RestaurantTable[]>(
    "restaurant_tables",
    DEFAULT_TABLES
  );
}
