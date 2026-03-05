import { useState, useMemo, useEffect } from "react";
import { useBills, useSettings } from "@/hooks/useEncryptedStorage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  FileText,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Banknote,
  Award,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Percent,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import { Bill } from "@/types/schema";
import { InvoiceModal } from "@/components/invoice-modal";
import { subWeeks } from "date-fns";

/* ================= TYPES ================= */
type DateFilter =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "thisYear"
  | "custom";

type DayFilter =
  | "all"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/* ================= COMPONENT ================= */
export default function Dashboard() {
  const { data: bills, isLoading } = useBills();
  const { data: settings } = useSettings();

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const isSingleDay = dateFilter === "today" || dateFilter === "yesterday";

    useEffect(() => {
  if (dateFilter === "today" || dateFilter === "yesterday") {
    setDayFilter("all");
  }
}, [dateFilter]);

  /* ================= FILTERED BILLS ================= */
  const filteredBills = useMemo(() => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (dateFilter) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;

    case "yesterday":
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;

    case "thisWeek":
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
      break;

    case "lastWeek":
      const lastWeek = subWeeks(new Date(), 1);
      start = startOfWeek(lastWeek, { weekStartsOn: 1 });
      end = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;

    case "thisMonth":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;

    case "thisYear":
      start = startOfYear(now);
      end = endOfYear(now);
      break;

    case "custom":
      if (!customRange.start || !customRange.end) return bills || [];
      start = startOfDay(new Date(customRange.start));
      end = endOfDay(new Date(customRange.end));
      break;

    default:
      return bills || [];
  }

  return (bills || []).filter((bill) => {
    const billDate = new Date(bill.dateISO);
    if (isNaN(billDate.getTime())) return false;

    const inDate = isWithinInterval(billDate, { start, end });
    if (!inDate) return false;

    if (dayFilter === "all") return true;

    return (
      format(billDate, "EEEE").toLowerCase() === dayFilter
    );
  });
  }, [bills, dateFilter, customRange, dayFilter]);
  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const totalSales = filteredBills.reduce((s, b) => s + b.total, 0);
    const totalBills = filteredBills.length;
    const avgBill = totalBills ? totalSales / totalBills : 0;
    const totalItems = filteredBills.reduce(
      (s, b) => s + b.items.reduce((x, i) => x + i.quantity, 0),
      0
    );

    const online = filteredBills.reduce(
      (s, b) => s + (b.onlineAmount || 0),
      0
    );
    const cash = filteredBills.reduce(
      (s, b) => s + (b.cashAmount || 0),
      0
    );

    const discount = filteredBills.reduce(
      (s, b) => s + (b.discount || 0),
      0
    );
    const discountBillsCount = filteredBills.filter(
      (b) => (b.discount || 0) > 0
    ).length;


    return {
      totalSales,
      totalBills,
      avgBill,
      totalItems,
      online,
      cash,
      discount,
      discountBillsCount,
    };
  }, [filteredBills]);

  /* ================= CUSTOMER STATS (FIXED LOGIC) ================= */
  const customerStats = useMemo(() => {
    const phoneMap = new Map<string, number>();
    let guest = 0;

    filteredBills.forEach((b) => {
      if (!b.customerPhone) guest++;
      else phoneMap.set(b.customerPhone, (phoneMap.get(b.customerPhone) || 0) + 1);
    });

    let repeat = 0;
    let fresh = 0;

    phoneMap.forEach((count) => {
      if (count > 1) repeat++;
      else fresh++;
    });

    return { repeat, fresh, guest };
  }, [filteredBills]);

  /* ================= TOP PRODUCTS ================= */
  const topSellingProducts = useMemo(() => {
    const map: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    filteredBills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.total;
      });
    });

    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredBills]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* ================= FILTER ROW ================= */}
      <div className="flex flex-wrap justify-between gap-4">
        {/* DATE FILTERS */}
        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["thisWeek", "This Week"],
            ["lastWeek", "Last Week"],
            ["thisMonth", "This Month"],
            ["thisYear", "This Year"],
            ["custom", "Custom"],
          ].map(([v, l]) => (
            <Button
              key={v}
              size="sm"
              variant={dateFilter === v ? "default" : "outline"}
              onClick={() => setDateFilter(v as DateFilter)}
            >
              {l}
            </Button>
          ))}
        </div>

        {/* DAY FILTERS */}
        <div className="flex flex-wrap gap-2">
          {[
            "all",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((d) => (
            <Button
              key={d}
              size="sm"
              disabled={isSingleDay}
              className={isSingleDay ? "opacity-50 cursor-not-allowed" : ""}
              variant={dayFilter === d ? "default" : "outline"}
              onClick={() => setDayFilter(d as DayFilter)}
            >
              {d.slice(0, 3).toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* CUSTOM DATE */}
      {dateFilter === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="h-10 px-3 rounded-md border bg-background text-foreground"
            value={customRange.start}
            onChange={(e) =>
              setCustomRange((p) => ({ ...p, start: e.target.value }))
            }
          />
          <input
            type="date"
            className="h-10 px-3 rounded-md border bg-background text-foreground"
            value={customRange.end}
            onChange={(e) =>
              setCustomRange((p) => ({ ...p, end: e.target.value }))
            }
          />
        </div>
      )}

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={`₹${stats.totalSales.toFixed(2)}`} icon={IndianRupee} />
        <StatCard title="Total Bills" value={stats.totalBills} icon={FileText} />
        <StatCard title="Avg Bill" value={`₹${stats.avgBill.toFixed(2)}`} icon={TrendingUp} />
        <StatCard title="Items Sold" value={stats.totalItems} icon={ShoppingBag} />
        <StatCard title="Online Payments" value={`₹${stats.online.toFixed(2)}`} icon={CreditCard} />
        <StatCard title="Cash Payments" value={`₹${stats.cash.toFixed(2)}`} icon={Banknote} />
        <StatCard title="Discount Given" value={`₹${stats.discount.toFixed(2)} (${stats.discountBillsCount} bills)`} icon={Percent} />
      </div>

      {/* ================= CUSTOMER CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Repeat Customers" value={customerStats.repeat} icon={UserCheck} />
        <StatCard title="New Customers" value={customerStats.fresh} icon={Users} />
        <StatCard title="Guest Customers" value={customerStats.guest} icon={UserX} />
      </div>

      {/* ================= TOP PRODUCTS ================= */}
      {topSellingProducts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
          </div>

          <div className="space-y-3">
            {topSellingProducts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{p.revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ================= RECENT BILLS ================= */}
      <Card className="p-4 sm:p-6 pb-10">
        <h2 className="text-lg font-semibold mb-4">Recent Bills</h2>

        {filteredBills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No bills found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 sm:p-3">Token</th>

                  {/* Date Header */}
                  <th className="text-left p-2 sm:p-3">
                    <span className="hidden sm:inline">Date & Time</span>
                    <span className="sm:hidden">D & T</span>
                  </th>

                  {/* Qty Hidden on Mobile */}
                  <th className="hidden sm:table-cell text-left p-3">
                    Qty
                  </th>

                  <th className="text-right p-2 sm:p-3">Total</th>

                  <th className="text-right p-2 sm:p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBills.map((b) => {
                  const qty = b.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={b.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition"
                      onClick={() => setSelectedBill(b)}
                    >
                      {/* Token */}
                      <td className="p-2 sm:p-3">
                        {b.token && settings.tokenVisible && (
                          <Badge variant="outline">#{b.token}</Badge>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-2 sm:p-3">
                        <span className="hidden sm:inline">
                          {format(new Date(b.dateISO), "dd MMM yyyy, hh:mm a")}
                        </span>
                        <span className="sm:hidden">
                          {format(new Date(b.dateISO), "dd/MM/yy hh:mm a")}
                        </span>
                      </td>

                      {/* Qty Hidden on Mobile */}
                      <td className="hidden sm:table-cell p-3">
                        {qty}
                      </td>

                      {/* Total */}
                      <td className="p-2 sm:p-3 text-right font-semibold">
                        ₹{b.total.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="p-2 sm:p-3 text-right">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>


      {selectedBill && (
        <InvoiceModal
          bill={selectedBill}
          settings={settings}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}

/* ================= SMALL CARD ================= */
function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <Icon className="h-6 w-6 text-primary" />
    </Card>
  );
}
