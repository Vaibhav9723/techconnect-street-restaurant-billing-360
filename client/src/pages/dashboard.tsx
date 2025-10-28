import { useState, useMemo } from 'react';
import { useBills, useSettings } from '@/hooks/useEncryptedStorage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  FileText,
  Award,
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, isWithinInterval } from 'date-fns';
import { Bill } from '@shared/schema';
import { InvoiceModal } from '@/components/invoice-modal';
import { cn } from '@/lib/utils';

type FilterOption = 'today' | 'yesterday' | 'thisMonth' | 'thisYear' | 'custom';

export default function Dashboard() {
  const { data: bills, isLoading } = useBills();
  const { data: settings } = useSettings();
  const [filter, setFilter] = useState<FilterOption>('today');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const filteredBills = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (filter) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'thisYear':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'custom':
        if (!customRange.start || !customRange.end) return bills;
        start = startOfDay(new Date(customRange.start));
        end = endOfDay(new Date(customRange.end));
        break;
      default:
        return bills;
    }

    return bills.filter((bill: Bill) => {
      const billDate = new Date(bill.dateISO);
      return isWithinInterval(billDate, { start, end });
    });
  }, [bills, filter, customRange]);

  const stats = useMemo(() => {
    const totalSales = filteredBills.reduce((sum: number, bill: Bill) => sum + bill.total, 0);
    const totalBills = filteredBills.length;
    const avgBill = totalBills > 0 ? totalSales / totalBills : 0;
    const totalItems = filteredBills.reduce((sum: number, bill: Bill) => 
      sum + bill.items.reduce((s, item) => s + item.quantity, 0), 0
    );

    return { totalSales, totalBills, avgBill, totalItems };
  }, [filteredBills]);

  const topSellingProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    filteredBills.forEach((bill: Bill) => {
      bill.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.total,
          });
        }
      });
    });

    return Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredBills]);

  const filterOptions = [
    { value: 'today' as const, label: 'Today' },
    { value: 'yesterday' as const, label: 'Yesterday' },
    { value: 'thisMonth' as const, label: 'This Month' },
    { value: 'thisYear' as const, label: 'This Year' },
    { value: 'custom' as const, label: 'Custom' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(option.value)}
            data-testid={`filter-${option.value}`}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filter === 'custom' && (
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="h-10 w-full px-4 rounded-lg border-2 border-input bg-background"
              data-testid="input-custom-start"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="h-10 w-full px-4 rounded-lg border-2 border-input bg-background"
              data-testid="input-custom-end"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-3xl font-bold tabular-nums mt-2" data-testid="stat-total-sales">
                ₹{stats.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bills</p>
              <p className="text-3xl font-bold tabular-nums mt-2" data-testid="stat-total-bills">
                {stats.totalBills}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-chart-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Bill</p>
              <p className="text-3xl font-bold tabular-nums mt-2" data-testid="stat-avg-bill">
                ₹{stats.avgBill.toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Items Sold</p>
              <p className="text-3xl font-bold tabular-nums mt-2" data-testid="stat-items-sold">
                {stats.totalItems}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-chart-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
          </div>
          
          <div className="space-y-3">
            {topSellingProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                data-testid={`top-product-${product.id}`}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">₹{product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bills Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Bills</h2>
        
        {filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bills found for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Token</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Date & Time</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold">Items</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Total</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill: Bill) => (
                  <tr
                    key={bill.id}
                    className="border-b hover-elevate cursor-pointer"
                    onClick={() => setSelectedBill(bill)}
                    data-testid={`bill-row-${bill.id}`}
                  >
                    <td className="px-4 py-3">
                      {bill.token && settings.tokenVisible && (
                        <Badge variant="outline" data-testid={`bill-token-${bill.id}`}>
                          #{bill.token}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(bill.dateISO), 'MMM dd, yyyy hh:mm a')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      ₹{bill.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBill(bill);
                        }}
                        data-testid={`button-view-bill-${bill.id}`}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
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
