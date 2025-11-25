import { useState, useEffect } from 'react';
import { useSettings, useProducts, useCategories, useBills, useTokens } from '@/hooks/useEncryptedStorage';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Settings as SettingsSchema } from '@shared/schema';
import { Download, Upload, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { encryptJSON, decryptJSON } from '@/utils/crypto';
import { wipeAllData } from '@/utils/storage';

export default function Settings() {
  const { data: settings, setData: setSettings } = useSettings();
  const { data: products, setData: setProducts } = useProducts();
  const { data: categories, setData: setCategories } = useCategories();
  const { data: bills, setData: setBills } = useBills();
  const { data: tokens, setData: setTokens } = useTokens();
  const { cryptoKey } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SettingsSchema>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSave = async () => {
    await setSettings(formData);
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated',
    });
  };

  const handleExportBackup = async () => {
    if (!cryptoKey) return;

    try {
      const backup = {
        version: 1,
        exportDate: new Date().toISOString(),
        data: {
          products,
          categories,
          bills,
          settings,
          tokens,
        },
      };

      const encrypted = await encryptJSON(cryptoKey, backup);
      const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exported',
        description: 'Encrypted backup file has been downloaded',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Failed to create backup file',
      });
    }
  };

  const handleImportBackup = async () => {
    if (!importFile || !cryptoKey) return;

    try {
      const fileContent = await importFile.text();
      const encrypted = JSON.parse(fileContent);
      const backup = await decryptJSON(cryptoKey, encrypted);

      if (importMode === 'overwrite') {
        // Overwrite all data - use the hooks that are already in scope
        const productsData = backup.data.products || [];
        const categoriesData = backup.data.categories || [];
        const billsData = backup.data.bills || [];
        const settingsData = backup.data.settings || settings;
        const tokensData = backup.data.tokens || tokens;

        await Promise.all([
          setProducts(productsData),
          setCategories(categoriesData),
          setBills(billsData),
          setSettings(settingsData),
          setTokens(tokensData),
        ]);
      } else {
        // Merge mode - combine arrays and avoid duplicates by ID
        const mergedProducts = [...products];
        const mergedCategories = [...categories];
        const mergedBills = [...bills];

        // Merge products (avoid duplicates by ID)
        const productIds = new Set(products.map((p: any) => p.id));
        (backup.data.products || []).forEach((p: any) => {
          if (!productIds.has(p.id)) {
            mergedProducts.push(p);
          }
        });

        // Merge categories
        const categoryIds = new Set(categories.map((c: any) => c.id));
        (backup.data.categories || []).forEach((c: any) => {
          if (!categoryIds.has(c.id)) {
            mergedCategories.push(c);
          }
        });

        // Merge bills
        const billIds = new Set(bills.map((b: any) => b.id));
        (backup.data.bills || []).forEach((b: any) => {
          if (!billIds.has(b.id)) {
            mergedBills.push(b);
          }
        });

        // Save merged data using the hooks
        await Promise.all([
          setProducts(mergedProducts),
          setCategories(mergedCategories),
          setBills(mergedBills),
          setSettings(backup.data.settings || settings),
          setTokens(backup.data.tokens || tokens),
        ]);
      }

      setShowImportDialog(false);
      setImportFile(null);
      
      toast({
        title: 'Backup imported',
        description: `Data has been ${importMode === 'overwrite' ? 'restored' : 'merged'}`,
      });
      
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: 'Failed to decrypt or import backup. Please ensure you entered the correct master password.',
      });
    }
  };

  const handleWipeData = () => {
    wipeAllData();
    toast({
      title: 'Data wiped',
      description: 'All data has been cleared. Reloading...',
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="p-6 lg:p-8 pb-24 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Shop Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Shop Information</h2>
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Shop Name</label>
            <Input
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="Enter shop name"
              className="h-12"
              data-testid="input-shop-name"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter shop address"
              className="h-12"
              data-testid="input-shop-address"
            />
          </div>
        </Card>
      </div>

      {/* GST Configuration */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">GST Configuration</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Enable GST</label>
              <p className="text-xs text-muted-foreground">Add GST to bills</p>
            </div>
            <Switch
              checked={formData.gstOn}
              onCheckedChange={(checked) => setFormData({ ...formData, gstOn: checked })}
              data-testid="switch-gst"
            />
          </div>

          {formData.gstOn && (
            <div>
              <label className="text-sm font-medium mb-2 block">GST Percentage</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.gstPercent}
                onChange={(e) => setFormData({ ...formData, gstPercent: parseFloat(e.target.value) || 0 })}
                className="h-12"
                data-testid="input-gst-percent"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Dark Mode</label>
              <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
            </div>
            <Switch
              checked={formData.theme === 'dark'}
              onCheckedChange={(checked) => setFormData({ ...formData, theme: checked ? 'dark' : 'light' })}
              data-testid="switch-theme"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Primary Color</label>
            <Select
              value={formData.primaryColor}
              onValueChange={(value: 'blue' | 'green' | 'purple' | 'orange' | 'red') => setFormData({ ...formData, primaryColor: value })}
            >
              <SelectTrigger className="h-12" data-testid="select-primary-color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Display Options</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Show Token Numbers</label>
              <p className="text-xs text-muted-foreground">Display tokens on bills</p>
            </div>
            <Switch
              checked={formData.tokenVisible}
              onCheckedChange={(checked) => setFormData({ ...formData, tokenVisible: checked })}
              data-testid="switch-token-visible"
            />
          </div>
        </Card>
      </div>

      {/* Print Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Print Settings</h2>
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Print Layout</label>
            <Select
              value={formData.printLayout}
              onValueChange={(value: 'A4' | '58mm' | '80mm') => setFormData({ ...formData, printLayout: value })}
            >
              <SelectTrigger className="h-12" data-testid="select-print-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 Paper</SelectItem>
                <SelectItem value="58mm">58mm Receipt</SelectItem>
                <SelectItem value="80mm">80mm Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <Button className="w-full h-12" onClick={handleSave} data-testid="button-save-settings">
        <Save className="h-5 w-5 mr-2" />
        Save Settings
      </Button>

      {/* Data Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
        <Card className="p-6 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleExportBackup}
            data-testid="button-export-backup"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Encrypted Backup
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => setShowImportDialog(true)}
            data-testid="button-import-backup"
          >
            <Upload className="h-5 w-5 mr-2" />
            Import Encrypted Backup
          </Button>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Wipe All Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all products, categories, bills, and settings. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowWipeDialog(true)}
                data-testid="button-wipe-data"
              >
                Wipe All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Wipe Confirmation Dialog */}
      <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
        <DialogContent data-testid="dialog-wipe-confirm">
          <DialogHeader>
            <DialogTitle>Confirm Data Wipe</DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This will delete all your data including products, categories, bills, and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWipeDialog(false)}
              data-testid="button-cancel-wipe"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWipeData}
              data-testid="button-confirm-wipe"
            >
              Yes, Wipe All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent data-testid="dialog-import-backup">
          <DialogHeader>
            <DialogTitle>Import Backup</DialogTitle>
            <DialogDescription>
              Select a backup file and choose how to import it
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Backup File</label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                data-testid="input-import-file"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Import Mode</label>
              <Select
                value={importMode}
                onValueChange={(value: 'merge' | 'overwrite') => setImportMode(value)}
              >
                <SelectTrigger data-testid="select-import-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge with existing data</SelectItem>
                  <SelectItem value="overwrite">Overwrite all data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportFile(null);
              }}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportBackup}
              disabled={!importFile}
              data-testid="button-confirm-import"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
