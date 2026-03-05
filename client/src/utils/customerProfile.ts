import { CustomerProfile } from "@/types/schema";

const KEY = "pos_customers";

export function getAllCustomers(): Record<string, CustomerProfile> {
  return JSON.parse(localStorage.getItem(KEY) || "{}");
}

export function getCustomer(phone: string): CustomerProfile | null {
  const all = getAllCustomers();
  return all[phone] ?? null;
}

export function saveCustomer(customer: CustomerProfile) {
  const all = getAllCustomers();
  all[customer.phone] = customer;
  localStorage.setItem(KEY, JSON.stringify(all));
}
