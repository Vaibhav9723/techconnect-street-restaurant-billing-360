// import { useState, useEffect } from 'react';
// import { useCategories, useBills, useTokens } from '@/hooks/useEncryptedStorage';
// import { useAuth } from '@/hooks/useAuth';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { useProducts } from "@/hooks/usePOSData";
// import { useSettings } from "@/hooks/usePOSData";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Settings as SettingsSchema } from "../types/schema";
// import { Download, Upload, AlertTriangle, Save } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { encryptJSON, decryptJSON } from '@/utils/crypto';
// import { wipeAllData } from '@/utils/storage';

// import { migrateOfflineDataToOnline } from "@/services/migration/offlineToOnline";
// import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
// import { usePOSMode } from "@/context/POSModeContext";
// import type { OfferSettings } from "@/types/schema";
// import { DEFAULT_OFFER_SETTINGS } from "@/utils/defaultOfferSettings";

//   const mergeOffers = (
//   current: OfferSettings | undefined,
//   update: Partial<OfferSettings>
// ): OfferSettings => ({
//   ...DEFAULT_OFFER_SETTINGS,
//   ...current,
//   ...update,
// });

// const mergeById = <T extends { id: string }>(
//   existing: T[],
//   incoming: T[]
// ): T[] => {
//   const map = new Map(existing.map(item => [item.id, item]));
//   incoming.forEach(item => {
//     map.set(item.id, item);
//   });
//   return Array.from(map.values());
// };


// export default function Settings() {
//   const { data: settings, setData: setSettings } = useSettings();
//   const { data: products, setData: setProducts } = useProducts();
//   const { data: categories, setData: setCategories } = useCategories();
//   const { data: bills, setData: setBills } = useBills();
//   const { data: tokens, setData: setTokens } = useTokens();
//   const { cryptoKey } = useAuth();
//   const { toast } = useToast();
//   const { userProfile, loading } = useFirebaseAuth();
//   const businessMode = userProfile?.businessMode;
//   const isValidGST = (gst: string) => gst.length === 15;



//   const [formData, setFormData] = useState<SettingsSchema>(settings);

//   useEffect(() => {
//     setFormData(settings);
//   }, [settings]);
//   const [showWipeDialog, setShowWipeDialog] = useState(false);
//   const [showImportDialog, setShowImportDialog] = useState(false);
//   const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
//   const [importFile, setImportFile] = useState<File | null>(null);

//   const handleSave = async () => {
//   const updated = {
//     ...formData,
//     updatedAt: Date.now(),
//   };

//   setFormData(updated);
//   await setSettings(updated);   // 🔥 THIS WAS MISSING

//   toast({
//     title: 'Settings saved',
//     description: 'Your settings have been updated',
//   });
// };

//   const handleExportBackup = async () => {
//     if (!cryptoKey) return;

//     try {
//       const backup = {
//         version: 1,
//         exportDate: new Date().toISOString(),
//         data: {
//           products,
//           categories,
//           bills,
//           // settings,
//           settings: formData,
//           tokens,
//         },
//       };

//       const encrypted = await encryptJSON(cryptoKey, backup);
//       const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
      
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);

//       toast({
//         title: 'Backup exported',
//         description: 'Encrypted backup file has been downloaded',
//       });
//     } catch (error) {
//       console.error('Export error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Export failed',
//         description: 'Failed to create backup file',
//       });
//     }
//   };

//   const handleImportBackup = async () => {
//     if (!importFile || !cryptoKey) return;

//     try {
//       const fileContent = await importFile.text();
//       const encrypted = JSON.parse(fileContent);
//       const backup = await decryptJSON(cryptoKey, encrypted);

//       if (!backup?.data) {
//         throw new Error("Invalid backup file");
//       }

//       if (importMode === 'overwrite') {
//         // Overwrite all data - use the hooks that are already in scope
//         const productsData = backup.data.products || [];
//         const categoriesData = backup.data.categories || [];
//         const billsData = backup.data.bills || [];
//         // const settingsData = backup.data.settings || settings;
//         const settingsData =
//         backup.data.settings ?? settings;
//         const tokensData = backup.data.tokens || tokens;

//         // await Promise.all([
//         //   setProducts(productsData),
//         //   setCategories(categoriesData),
//         //   setBills(billsData),
//         //   setFormData(settingsData),
//         //   setTokens(tokensData),
//         // ]);
//         await Promise.all([
//         setProducts(productsData),
//         setCategories(categoriesData),
//         setBills(billsData),
//         setTokens(tokensData),
//       ]);

//       setFormData(settingsData);
//       await setSettings(settingsData);
//     } else {

//     const mergedProducts = mergeById(
//       products,
//       backup.data.products || []
//     );

//     const mergedCategories = mergeById(
//       categories,
//       backup.data.categories || []
//     );

//     const mergedBills = mergeById(
//       bills,
//       backup.data.bills || []
//     );

//     await Promise.all([
//       setProducts(mergedProducts),
//       setCategories(mergedCategories),
//       setBills(mergedBills),
//       setTokens(backup.data.tokens || tokens),
//     ]);

//     // const newSettings = backup.data.settings || settings;
//     const newSettings =
//     backup.data.settings ?? settings;
//     setFormData(newSettings);
//     await setSettings(newSettings);
//   }


//       setShowImportDialog(false);
//       setImportFile(null);
      
//       toast({
//         title: 'Backup imported',
//         description: `Data has been ${importMode === 'overwrite' ? 'restored' : 'merged'}`,
//       });
      
//       // Reload page to apply changes
//       setTimeout(() => window.location.reload(), 1000);
//     } catch (error) {
//       console.error('Import error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Import failed',
//         description: 'Failed to decrypt or import backup. Please ensure you entered the correct master password.',
//       });
//     }
//   };

//   const handleWipeData = () => {
//     wipeAllData();
//     toast({
//       title: 'Data wiped',
//       description: 'All data has been cleared. Reloading...',
//     });
//     setTimeout(() => window.location.reload(), 1000);
//   };


//   const { user } = useFirebaseAuth();
//   const posMode = usePOSMode();


//   return (
//     <div className="p-6 lg:p-8 pb-24 max-w-2xl mx-auto space-y-8">
//       <h1 className="text-2xl font-semibold">Settings</h1>

//       {/* Shop Information */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Shop Information</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Shop Name</label>
//             <Input
//               value={formData.shopName}
//               onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
//               placeholder="Enter shop name"
//               className="h-12"
//               data-testid="input-shop-name"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Address</label>
//             <Input
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               placeholder="Enter shop address"
//               className="h-12"
//               data-testid="input-shop-address"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* GST Configuration */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">GST Configuration</h2>

//         <Card className="p-6 space-y-4">

//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Enable GST</label>
//             </div>
//             <Switch
//               checked={formData.gstOn}
//               onCheckedChange={(checked) =>
//                 setFormData({ ...formData, gstOn: checked })
//               }
//             />
//           </div>

//           {formData.gstOn && (
//             <>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Number
//                 </label>
//                 <Input
//                   placeholder="Enter GST Number (e.g. 22AAAAA0000A1Z5)"
//                   value={formData.gstNumber || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstNumber: e.target.value.toUpperCase(),
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Percentage
//                 </label>
//                 <Input
//                   type="number"
//                   value={formData.gstPercent}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstPercent: Number(e.target.value),
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Mode
//                 </label>
//                 <Select
//                   value={formData.gstMode}
//                   onValueChange={(v: "INCLUSIVE" | "EXCLUSIVE") =>
//                     setFormData({ ...formData, gstMode: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="EXCLUSIVE">
//                       GST Exclusive (Add above price)
//                     </SelectItem>
//                     <SelectItem value="INCLUSIVE">
//                       GST Inclusive (Included in price)
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Type
//                 </label>
//                 <Select
//                   value={formData.gstType}
//                   onValueChange={(v: "CGST_SGST" | "IGST") =>
//                     setFormData({ ...formData, gstType: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="CGST_SGST">
//                       CGST + SGST
//                     </SelectItem>
//                     <SelectItem value="IGST">
//                       IGST
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </>
//           )}
//         </Card>
//       </div>

//       <Card className="p-6 space-y-4">
//         <h3 className="text-lg font-semibold">Customer Offers</h3>

//         {/* ENABLE OFFERS */}
//         <div className="flex items-center justify-between">
//           <span className="text-sm">Enable Offers</span>
//           <Switch
//             checked={formData.offers?.enabled ?? false}
//             onCheckedChange={(v) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, { enabled: v }),
//             })
//       }

//           />
//         </div>
//         <div className="flex items-center justify-between">
//         <span className="text-sm">Discount Apply Mode</span>

//         <select
//           className="border rounded px-2 py-1 text-sm bg-white text-black 
//                   dark:bg-zinc-900 dark:text-white 
//                   dark:border-zinc-600"
//           value={formData.offers?.applyMode ?? "AUTO"}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: {
//                 ...formData.offers!,
//                 applyMode: e.target.value as "AUTO" | "MANUAL",
//               },
//             })
//           }
//         >
//           <option value="AUTO">Automatic</option>
//           <option value="MANUAL">Manual (Coupon)</option>
//         </select>
//       </div>


//         {/* BILL AMOUNT OFFER */}
//         <div className="border rounded-md p-4 space-y-3">
//           <div className="flex items-center justify-between">
//             <h4 className="font-medium text-sm">Bill Amount Offer</h4>
//             <Switch
//               checked={formData.offers?.billAmountOffer?.enabled ?? false}
//               onCheckedChange={(v) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       // ...formData.offers!.billAmountOffer,
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       enabled: v,
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <Input
//               type="number"
//               placeholder="Min Bill Amount"
//               value={formData.offers?.billAmountOffer?.minBillAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       // ...formData.offers!.billAmountOffer,
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       minBillAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />

//             <Input
//               type="number"
//               placeholder="Next Bill Min Amount"
//               value={formData.offers?.billAmountOffer?.nextBillMinAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       // ...formData.offers!.billAmountOffer,
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       nextBillMinAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//           <Input
//             type="number"
//             // placeholder="Discount Value"
//             placeholder={
//               formData.offers?.billAmountOffer?.discountType === "PERCENT"
//                 ? "Discount %"
//                 : "Discount ₹"
//             }
//             value={formData.offers?.billAmountOffer?.discountValue ?? ""}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     // ...formData.offers!.billAmountOffer,
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     discountValue: Number(e.target.value),
//                   },
//                 }),
//               })
//             }
//           />
//           <select
//             className="border rounded px-2 py-1 text-sm bg-white text-black 
//                   dark:bg-zinc-900 dark:text-white 
//                   dark:border-zinc-600"
//             value={formData.offers?.billAmountOffer?.discountType ?? "PERCENT"}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     // ...formData.offers!.billAmountOffer,
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     discountType: e.target.value as "PERCENT" | "FLAT",
//                   },
//                 }),
//               })
//             }
//           >
//             <option value="PERCENT">Percentage (%)</option>
//             <option value="FLAT">Flat Amount (₹)</option>
//           </select>


//           <Input
//             type="number"
//             placeholder="Coupon Valid Days (eg. 7, 15, 30)"
//             value={formData.offers?.billAmountOffer?.validDays ?? ""}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     // ...formData.offers!.billAmountOffer,
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     validDays: Number(e.target.value),
//                   },
//                 }),
//               })
//             }
//           />
//       </div>

//         </div>

//         {/* FOOTER TEXT */}
//         <Input
//           placeholder="Footer text (Bulk order / Party order etc)"
//           value={formData.offers?.footerText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 footerText: e.target.value,
//               }),
//             })
//           }
//         />

//         {/* FEEDBACK */}
//         <Input
//           placeholder="Feedback text"
//           value={formData.offers?.feedbackText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackText: e.target.value,
//               }),
//             })
//           }
//         />

//         <Input
//           placeholder="Feedback link"
//           value={formData.offers?.feedbackLink ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackLink: e.target.value,
//               }),
//             })
//           }
//         />
//       </Card>

//       {/* <p>Mode : {businessMode}</p> */}
//       <Card className="p-4">
//         <div className="flex justify-between">
//           <span className="text-sm font-medium py-1">Business Mode</span>
//           <span className="text-sm capitalize px-3 py-1 rounded-full 
//              bg-primary text-primary-foreground 
//              font-medium shadow-sm">{businessMode}</span>
//         </div>
//       </Card>

//       {businessMode === "restaurant" && (
//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Restaurant Table Settings</h2>

//           <Card className="p-6 space-y-6">

//             {/* Table Count Controller */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="text-sm font-medium block">
//                   Number of Tables
//                 </label>
//                 <p className="text-xs text-muted-foreground">
//                   Total tables available in your restaurant
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.max(1, (formData.tableCount ?? 5) - 1),
//                     })
//                   }
//                 >
//                   -
//                 </Button>

//                 <div className="w-16 text-center text-lg font-semibold">
//                   {formData.tableCount ?? 5}
//                 </div>

//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.min(100, (formData.tableCount ?? 5) + 1),
//                     })
//                   }
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>

//             {/* Quick Presets */}
//             <div className="flex flex-wrap gap-2">
//               {[10, 15, 20,25,30].map((n) => (
//                 <Button
//                   key={n}
//                   size="sm"
//                   variant={
//                     formData.tableCount === n ? "default" : "outline"
//                   }
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: n,
//                     })
//                   }
//                 >
//                   {n} Tables
//                 </Button>
//               ))}
//             </div>

//           </Card>
//         </div>
//       )}

//       {/* Appearance */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Appearance</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Dark Mode</label>
//               <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
//             </div>
//             <Switch
//               checked={formData.theme === 'dark'}
//               onCheckedChange={async (checked) => {
//                 const newTheme: 'light' | 'dark' = checked ? 'dark' : 'light';
//                 const updated = { ...formData, theme: newTheme };
//                 setFormData(updated);
//                 await setSettings(updated);
//               }}
//               data-testid="switch-theme"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Primary Color</label>
//             <Select
//               value={formData.primaryColor}
//               onValueChange={async (value: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'custom') => {
//                 const updated = { ...formData, primaryColor: value };
//                 setFormData(updated);
//                 // await setFormData(updated);
//                 await setSettings(updated);
//               }}
//             >
//               <SelectTrigger className="h-12" data-testid="select-primary-color">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="blue">Blue</SelectItem>
//                 <SelectItem value="green">Green</SelectItem>
//                 <SelectItem value="yellow">Yellow</SelectItem>
//                 <SelectItem value="orange">Orange</SelectItem>
//                 <SelectItem value="red">Red</SelectItem>
//                 <SelectItem value="custom">Custom</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {formData.primaryColor === 'custom' && (
//             <div>
//               <label className="text-sm font-medium mb-2 block">Custom Color</label>
//               <div className="flex gap-2 items-center">
//                 <Input
//                   type="color"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     // await setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   className="h-12 w-20"
//                   data-testid="input-custom-color"
//                 />
//                 <Input
//                   type="text"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     // await setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   placeholder="#ffdf00"
//                   className="h-12 flex-1"
//                   data-testid="input-custom-color-text"
//                 />
//               </div>
//             </div>
//           )}
//         </Card>
//       </div>

//       {/* Display Options */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Display Options</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Show Token Numbers</label>
//               <p className="text-xs text-muted-foreground">Display tokens on bills</p>
//             </div>
//             <Switch
//               checked={formData.tokenVisible}
//               onCheckedChange={(checked) => setFormData({ ...formData, tokenVisible: checked })}
//               data-testid="switch-token-visible"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* Print Settings */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Print Settings</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Print Layout</label>
//             <Select
//               value={formData.printLayout}
//               onValueChange={(value: 'A4' | '58mm' | '80mm') => setFormData({ ...formData, printLayout: value })}
//             >
//               <SelectTrigger className="h-12" data-testid="select-print-layout">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="A4">A4 Paper</SelectItem>
//                 <SelectItem value="58mm">58mm Receipt</SelectItem>
//                 <SelectItem value="80mm">80mm Receipt</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </Card>
//       </div>

//       {/* Save Button */}
//       <Button className="w-full h-12" onClick={handleSave} data-testid="button-save-settings">
//         <Save className="h-5 w-5 mr-2" />
//         Save Settings
//       </Button>

//       {/* Data Management */}

//       {/* <p>POS MODE: {posMode}</p> */}

//       {/* Data Management */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Data Management</h2>

//         <Card className="p-6 space-y-3">

//           {/* 🔥 ONLY FOR ONLINE POS */}
//           {posMode === "online" && (
//             <Button
//               variant="outline"
//               className="w-full justify-start h-12"
//               onClick={async () => {
//                 if (!user) return;

//                 await migrateOfflineDataToOnline(user.uid, {
//                   products,
//                   categories,
//                   bills,
//                   // settings,
//                   settings: formData,
//                 });

//                 toast({
//                   title: "Upload complete",
//                   description: "Offline data uploaded to cloud",
//                 });
//               }}
//             >
//               Upload Offline Data to Cloud
//             </Button>
//           )}

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={handleExportBackup}
//           >
//             <Download className="h-5 w-5 mr-2" />
//             Export Encrypted Backup
//           </Button>

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={() => setShowImportDialog(true)}
//           >
//             <Upload className="h-5 w-5 mr-2" />
//             Import Encrypted Backup
//           </Button>

//         </Card>
//       </div>


//       {/* Danger Zone */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
//         <Card className="p-6 border-destructive">
//           <div className="flex items-start gap-4">
//             <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
//             <div className="flex-1">
//               <h3 className="font-semibold mb-1">Wipe All Data</h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 This will permanently delete all products, categories, bills, and settings. This action cannot be undone.
//               </p>
//               <Button
//                 variant="destructive"
//                 onClick={() => setShowWipeDialog(true)}
//                 data-testid="button-wipe-data"
//               >
//                 Wipe All Data
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Wipe Confirmation Dialog */}
//       <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
//         <DialogContent data-testid="dialog-wipe-confirm">
//           <DialogHeader>
//             <DialogTitle>Confirm Data Wipe</DialogTitle>
//             <DialogDescription>
//               Are you absolutely sure? This will delete all your data including products, categories, bills, and settings. This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowWipeDialog(false)}
//               data-testid="button-cancel-wipe"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleWipeData}
//               data-testid="button-confirm-wipe"
//             >
//               Yes, Wipe All Data
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Import Dialog */}
//       <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
//         <DialogContent data-testid="dialog-import-backup">
//           <DialogHeader>
//             <DialogTitle>Import Backup</DialogTitle>
//             <DialogDescription>
//               Select a backup file and choose how to import it
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">Backup File</label>
//               <Input
//                 type="file"
//                 accept=".json"
//                 onChange={(e) => setImportFile(e.target.files?.[0] || null)}
//                 data-testid="input-import-file"
//               />
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Import Mode</label>
//               <Select
//                 value={importMode}
//                 onValueChange={(value: 'merge' | 'overwrite') => setImportMode(value)}
//               >
//                 <SelectTrigger data-testid="select-import-mode">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="merge">Merge with existing data</SelectItem>
//                   <SelectItem value="overwrite">Overwrite all data</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowImportDialog(false);
//                 setImportFile(null);
//               }}
//               data-testid="button-cancel-import"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleImportBackup}
//               disabled={!importFile}
//               data-testid="button-confirm-import"
//             >
//               Import
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// import { useState, useEffect } from 'react';
// import { useCategories, useBills, useTokens } from '@/hooks/useEncryptedStorage';
// import { useAuth } from '@/hooks/useAuth';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { useProducts } from "@/hooks/usePOSData";
// import { useSettings } from "@/hooks/usePOSData";
// import { Loader2 } from 'lucide-react';
// import { wipeFirebaseData } from "@/services/firestore/wipe";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Settings as SettingsSchema } from "../types/schema";
// import { Download, Upload, AlertTriangle, Save } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { encryptJSON, decryptJSON } from '@/utils/crypto';
// import { wipeAllData } from '@/utils/storage';

// import { migrateOfflineDataToOnline } from "@/services/migration/offlineToOnline";
// import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
// import { usePOSMode } from "@/context/POSModeContext";
// import type { OfferSettings } from "@/types/schema";
// import { DEFAULT_OFFER_SETTINGS } from "@/utils/defaultOfferSettings";
// import { mergeById } from "@/services/sync/mergeById";

//   const mergeOffers = (
//   current: OfferSettings | undefined,
//   update: Partial<OfferSettings>
// ): OfferSettings => ({
//   ...DEFAULT_OFFER_SETTINGS,
//   ...current,
//   ...update,
// });
// import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

// export default function Settings() {
//   const { data: settings, setData: setSettings } = useSettings();
//   const { data: products, setData: setProducts } = useProducts();
//   const { data: categories, setData: setCategories } = useCategories();
//   const { data: bills, setData: setBills } = useBills();
//   const { data: tokens, setData: setTokens } = useTokens();
//   const { cryptoKey } = useAuth();
//   const { toast } = useToast();
//   const { userProfile, loading } = useFirebaseAuth();
//   const businessMode = userProfile?.businessMode;
//   const isValidGST = (gst: string) => gst.length === 15;
//   const [isWiping, setIsWiping] = useState(false);


//   const [formData, setFormData] = useState<SettingsSchema>(settings);

//   useEffect(() => {
//     setFormData(settings);
//   }, [settings]);
//   const [showWipeDialog, setShowWipeDialog] = useState(false);
//   const [showImportDialog, setShowImportDialog] = useState(false);
//   const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
//   const [importFile, setImportFile] = useState<File | null>(null);

//   const handleSave = async () => {
//   const updated = {
//     ...formData,
//     updatedAt: Date.now(),
//   };

//   setFormData(updated);
//   await setSettings(updated);

//   toast({
//     title: 'Settings saved',
//     description: 'Your settings have been updated',
//   });
// };

//   const handleExportBackup = async () => {
//     if (!cryptoKey) return;

//     try {
//       const backup = {
//         version: 1,
//         exportDate: new Date().toISOString(),
//         data: {
//           products,
//           categories,
//           bills,
//           settings: formData,
//           tokens,
//         },
//       };

//       const encrypted = await encryptJSON(cryptoKey, backup);
//       const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
      
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);

//       toast({
//         title: 'Backup exported',
//         description: 'Encrypted backup file has been downloaded',
//       });
//     } catch (error) {
//       console.error('Export error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Export failed',
//         description: 'Failed to create backup file',
//       });
//     }
//   };

//   const handleImportBackup = async () => {
//     if (!importFile || !cryptoKey) return;

//     try {
//       const fileContent = await importFile.text();
//       const encrypted = JSON.parse(fileContent);
//       const backup = await decryptJSON(cryptoKey, encrypted);

//       if (!backup?.data) {
//         throw new Error("Invalid backup file");
//       }

//       if (importMode === 'overwrite') {
//         const productsData = backup.data.products || [];
//         const categoriesData = backup.data.categories || [];
//         const billsData = backup.data.bills || [];
//         const settingsData = backup.data.settings ?? settings;
//         const tokensData = backup.data.tokens || tokens;

//         await Promise.all([
//           setProducts(productsData),
//           setCategories(categoriesData),
//           setBills(billsData),
//           setTokens(tokensData),
//         ]);

//         setFormData(settingsData);
//         await setSettings(settingsData);
//       } else {
//         // Merge using id + updatedAt safe mergeById
//         const mergedProducts = mergeById(
//           products,
//           backup.data.products || []
//         );

//         const mergedCategories = mergeById(
//           categories,
//           backup.data.categories || []
//         );

//         const mergedBills = mergeById(
//           bills,
//           backup.data.bills || []
//         );

//         await Promise.all([
//           setProducts(mergedProducts),
//           setCategories(mergedCategories),
//           setBills(mergedBills),
//           setTokens(backup.data.tokens || tokens),
//         ]);

//         const newSettings = backup.data.settings ?? settings;
//         setFormData(newSettings);
//         await setSettings(newSettings);
//       }

//       setShowImportDialog(false);
//       setImportFile(null);
      
//       toast({
//         title: 'Backup imported',
//         description: `Data has been ${importMode === 'overwrite' ? 'restored' : 'merged'}`,
//       });
      
//       setTimeout(() => window.location.reload(), 1000);
//     } catch (error) {
//       console.error('Import error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Import failed',
//         description: 'Failed to decrypt or import backup. Please ensure you entered the correct master password.',
//       });
//     }
//   };

//   // const handleWipeData = () => {
//   //   wipeAllData();
//   //   toast({
//   //     title: 'Data wiped',
//   //     description: 'All data has been cleared. Reloading...',
//   //   });
//   //   setTimeout(() => window.location.reload(), 1000);
//   // };
//   const handleWipeData = async () => {
//     setIsWiping(true);
//     try {
//       wipeAllData();

//       if (posMode === "online" && user?.uid) {
//         try {
//           await wipeFirebaseData(user.uid);
//         } catch (firebaseError) {
//           console.error("Firebase wipe error:", firebaseError);
//           toast({
//             variant: 'destructive',
//             title: 'Cloud wipe failed',
//             description: 'Local data was wiped, but cloud data could not be deleted. Check your connection and try again.',
//           });
//           setTimeout(() => window.location.reload(), 2000);
//           return;
//         }
//       }

//       toast({
//         title: 'Data wiped',
//         description: posMode === "online"
//           ? 'All local and cloud data has been cleared. Reloading...'
//           : 'All local data has been cleared. Reloading...',
//       });
//       setTimeout(() => window.location.reload(), 1000);
//     } catch (error) {
//       console.error('Wipe error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Wipe failed',
//         description: 'An error occurred while wiping data.',
//       });
//     } finally {
//       setIsWiping(false);
//     }
//   };

//   const { user } = useFirebaseAuth();
//   const posMode = usePOSMode();


//   return (
//     <div className="p-6 lg:p-8 pb-24 max-w-2xl mx-auto space-y-8">
//       <h1 className="text-2xl font-semibold">Settings</h1>

//       {/* Shop Information */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Shop Information</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Shop Name</label>
//             <Input
//               value={formData.shopName}
//               onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
//               placeholder="Enter shop name"
//               className="h-12"
//               data-testid="input-shop-name"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Address</label>
//             <Input
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               placeholder="Enter shop address"
//               className="h-12"
//               data-testid="input-shop-address"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* GST Configuration */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">GST Configuration</h2>

//         <Card className="p-6 space-y-4">

//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Enable GST</label>
//             </div>
//             <Switch
//               checked={formData.gstOn}
//               onCheckedChange={(checked) =>
//                 setFormData({ ...formData, gstOn: checked })
//               }
//             />
//           </div>

//           {formData.gstOn && (
//             <>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Number
//                 </label>
//                 <Input
//                   placeholder="Enter GST Number (e.g. 22AAAAA0000A1Z5)"
//                   value={formData.gstNumber || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstNumber: e.target.value.toUpperCase(),
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Percentage
//                 </label>
//                 <Input
//                   type="number"
//                   value={formData.gstPercent}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstPercent: Number(e.target.value),
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Mode
//                 </label>
//                 <Select
//                   value={formData.gstMode}
//                   onValueChange={(v: "INCLUSIVE" | "EXCLUSIVE") =>
//                     setFormData({ ...formData, gstMode: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="EXCLUSIVE">
//                       GST Exclusive (Add above price)
//                     </SelectItem>
//                     <SelectItem value="INCLUSIVE">
//                       GST Inclusive (Included in price)
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Type
//                 </label>
//                 <Select
//                   value={formData.gstType}
//                   onValueChange={(v: "CGST_SGST" | "IGST") =>
//                     setFormData({ ...formData, gstType: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="CGST_SGST">
//                       CGST + SGST
//                     </SelectItem>
//                     <SelectItem value="IGST">
//                       IGST
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </>
//           )}
//         </Card>
//       </div>

//       <Card className="p-6 space-y-4">
//         <h3 className="text-lg font-semibold">Customer Offers</h3>

//         <div className="flex items-center justify-between">
//           <span className="text-sm">Enable Offers</span>
//           <Switch
//             checked={formData.offers?.enabled ?? false}
//             onCheckedChange={(v) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, { enabled: v }),
//             })
//       }
//           />
//         </div>
//         <div className="flex items-center justify-between">
//         <span className="text-sm">Discount Apply Mode</span>

//         <select
//           className="border rounded px-2 py-1 text-sm bg-white text-black 
//                   dark:bg-zinc-900 dark:text-white 
//                   dark:border-zinc-600"
//           value={formData.offers?.applyMode ?? "AUTO"}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: {
//                 ...formData.offers!,
//                 applyMode: e.target.value as "AUTO" | "MANUAL",
//               },
//             })
//           }
//         >
//           <option value="AUTO">Automatic</option>
//           <option value="MANUAL">Manual (Coupon)</option>
//         </select>
//       </div>

//         <div className="border rounded-md p-4 space-y-3">
//           <div className="flex items-center justify-between">
//             <h4 className="font-medium text-sm">Bill Amount Offer</h4>
//             <Switch
//               checked={formData.offers?.billAmountOffer?.enabled ?? false}
//               onCheckedChange={(v) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       enabled: v,
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <Input
//               type="number"
//               placeholder="Min Bill Amount"
//               value={formData.offers?.billAmountOffer?.minBillAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       minBillAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />

//             <Input
//               type="number"
//               placeholder="Next Bill Min Amount"
//               value={formData.offers?.billAmountOffer?.nextBillMinAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       nextBillMinAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//           <Input
//             type="number"
//             placeholder={
//               formData.offers?.billAmountOffer?.discountType === "PERCENT"
//                 ? "Discount %"
//                 : "Discount ₹"
//             }
//             value={formData.offers?.billAmountOffer?.discountValue ?? ""}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     discountValue: Number(e.target.value),
//                   },
//                 }),
//               })
//             }
//           />
//           <select
//             className="border rounded px-2 py-1 text-sm bg-white text-black 
//                   dark:bg-zinc-900 dark:text-white 
//                   dark:border-zinc-600"
//             value={formData.offers?.billAmountOffer?.discountType ?? "PERCENT"}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     discountType: e.target.value as "PERCENT" | "FLAT",
//                   },
//                 }),
//               })
//             }
//           >
//             <option value="PERCENT">Percentage (%)</option>
//             <option value="FLAT">Flat Amount (₹)</option>
//           </select>

//           <Input
//             type="number"
//             placeholder="Coupon Valid Days (eg. 7, 15, 30)"
//             value={formData.offers?.billAmountOffer?.validDays ?? ""}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, {
//                   billAmountOffer: {
//                     ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                     validDays: Number(e.target.value),
//                   },
//                 }),
//               })
//             }
//           />
//       </div>

//         </div>

//         <Input
//           placeholder="Footer text (Bulk order / Party order etc)"
//           value={formData.offers?.footerText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 footerText: e.target.value,
//               }),
//             })
//           }
//         />

//         <Input
//           placeholder="Feedback text"
//           value={formData.offers?.feedbackText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackText: e.target.value,
//               }),
//             })
//           }
//         />

//         <Input
//           placeholder="Feedback link"
//           value={formData.offers?.feedbackLink ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackLink: e.target.value,
//               }),
//             })
//           }
//         />
//       </Card>

//       <Card className="p-4">
//         <div className="flex justify-between">
//           <span className="text-sm font-medium py-1">Business Mode</span>
//           <span className="text-sm capitalize px-3 py-1 rounded-full 
//              bg-primary text-primary-foreground 
//              font-medium shadow-sm">{businessMode}</span>
//         </div>
//       </Card>

//       {businessMode === "restaurant" && (
//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Restaurant Table Settings</h2>

//           <Card className="p-6 space-y-6">

//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="text-sm font-medium block">
//                   Number of Tables
//                 </label>
//                 <p className="text-xs text-muted-foreground">
//                   Total tables available in your restaurant
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.max(1, (formData.tableCount ?? 5) - 1),
//                     })
//                   }
//                 >
//                   -
//                 </Button>

//                 <div className="w-16 text-center text-lg font-semibold">
//                   {formData.tableCount ?? 5}
//                 </div>

//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.min(100, (formData.tableCount ?? 5) + 1),
//                     })
//                   }
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {[10, 15, 20,25,30].map((n) => (
//                 <Button
//                   key={n}
//                   size="sm"
//                   variant={
//                     formData.tableCount === n ? "default" : "outline"
//                   }
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: n,
//                     })
//                   }
//                 >
//                   {n} Tables
//                 </Button>
//               ))}
//             </div>

//           </Card>
//         </div>
//       )}

//       {/* Appearance */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Appearance</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Dark Mode</label>
//               <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
//             </div>
//             <Switch
//               checked={formData.theme === 'dark'}
//               onCheckedChange={async (checked) => {
//                 const newTheme: 'light' | 'dark' = checked ? 'dark' : 'light';
//                 const updated = { ...formData, theme: newTheme };
//                 setFormData(updated);
//                 await setSettings(updated);
//               }}
//               data-testid="switch-theme"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Primary Color</label>
//             <Select
//               value={formData.primaryColor}
//               onValueChange={async (value: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'custom') => {
//                 const updated = { ...formData, primaryColor: value };
//                 setFormData(updated);
//                 await setSettings(updated);
//               }}
//             >
//               <SelectTrigger className="h-12" data-testid="select-primary-color">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="blue">Blue</SelectItem>
//                 <SelectItem value="green">Green</SelectItem>
//                 <SelectItem value="yellow">Yellow</SelectItem>
//                 <SelectItem value="orange">Orange</SelectItem>
//                 <SelectItem value="red">Red</SelectItem>
//                 <SelectItem value="custom">Custom</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {formData.primaryColor === 'custom' && (
//             <div>
//               <label className="text-sm font-medium mb-2 block">Custom Color</label>
//               <div className="flex gap-2 items-center">
//                 <Input
//                   type="color"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   className="h-12 w-20"
//                   data-testid="input-custom-color"
//                 />
//                 <Input
//                   type="text"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   placeholder="#ffdf00"
//                   className="h-12 flex-1"
//                   data-testid="input-custom-color-text"
//                 />
//               </div>
//             </div>
//           )}
//         </Card>
//       </div>

//       {/* Display Options */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Display Options</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Show Token Numbers</label>
//               <p className="text-xs text-muted-foreground">Display tokens on bills</p>
//             </div>
//             <Switch
//               checked={formData.tokenVisible}
//               onCheckedChange={(checked) => setFormData({ ...formData, tokenVisible: checked })}
//               data-testid="switch-token-visible"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* Print Settings */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Print Settings</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Print Layout</label>
//             <Select
//               value={formData.printLayout}
//               onValueChange={(value: 'A4' | '58mm' | '80mm') => setFormData({ ...formData, printLayout: value })}
//             >
//               <SelectTrigger className="h-12" data-testid="select-print-layout">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="A4">A4 Paper</SelectItem>
//                 <SelectItem value="58mm">58mm Receipt</SelectItem>
//                 <SelectItem value="80mm">80mm Receipt</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </Card>
//       </div>

//       {/* Save Button */}
//       <Button className="w-full h-12" onClick={handleSave} data-testid="button-save-settings">
//         <Save className="h-5 w-5 mr-2" />
//         Save Settings
//       </Button>

//       {/* Data Management */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Data Management</h2>

//         <Card className="p-6 space-y-3">

//           {/* ONLY FOR ONLINE POS */}
//           {posMode === "online" && (
//             <Button
//               variant="outline"
//               className="w-full justify-start h-12"
//               onClick={async () => {
//                 if (!user) return;

//                 await migrateOfflineDataToOnline(user.uid, {
//                   products,
//                   categories,
//                   bills,
//                   settings: formData,
//                 });

//                 toast({
//                   title: "Upload complete",
//                   description: "Offline data uploaded to cloud",
//                 });
//               }}
//             >
//               Upload Offline Data to Cloud
//             </Button>
//           )}

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={handleExportBackup}
//           >
//             <Download className="h-5 w-5 mr-2" />
//             Export Encrypted Backup
//           </Button>

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={() => setShowImportDialog(true)}
//           >
//             <Upload className="h-5 w-5 mr-2" />
//             Import Encrypted Backup
//           </Button>

//         </Card>
//       </div>


//       {/* Danger Zone */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
//         <Card className="p-6 border-destructive">
//           <div className="flex items-start gap-4">
//             <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
//             <div className="flex-1">
//               <h3 className="font-semibold mb-1">Wipe All Data</h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 This will permanently delete all products, categories, bills, and settings. This action cannot be undone.
//               </p>
//               <Button
//                 variant="destructive"
//                 onClick={() => setShowWipeDialog(true)}
//                 data-testid="button-wipe-data"
//               >
//                 Wipe All Data
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Wipe Confirmation Dialog */}
//       <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
//         <DialogContent data-testid="dialog-wipe-confirm">
//           <DialogHeader>
//             <DialogTitle>Confirm Data Wipe</DialogTitle>
//             <DialogDescription>
//               Are you absolutely sure? This will delete all your data including products, categories, bills, and settings. This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowWipeDialog(false)}
//               data-testid="button-cancel-wipe"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleWipeData}
//               data-testid="button-confirm-wipe"
//             >
//               Yes, Wipe All Data
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Import Dialog */}
//       <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
//         <DialogContent data-testid="dialog-import-backup">
//           <DialogHeader>
//             <DialogTitle>Import Backup</DialogTitle>
//             <DialogDescription>
//               Select a backup file and choose how to import it
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">Backup File</label>
//               <Input
//                 type="file"
//                 accept=".json"
//                 onChange={(e) => setImportFile(e.target.files?.[0] || null)}
//                 data-testid="input-import-file"
//               />
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Import Mode</label>
//               <Select
//                 value={importMode}
//                 onValueChange={(value: 'merge' | 'overwrite') => setImportMode(value)}
//               >
//                 <SelectTrigger data-testid="select-import-mode">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="merge">Merge with existing data</SelectItem>
//                   <SelectItem value="overwrite">Overwrite all data</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowImportDialog(false);
//                 setImportFile(null);
//               }}
//               data-testid="button-cancel-import"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleImportBackup}
//               disabled={!importFile}
//               data-testid="button-confirm-import"
//             >
//               Import
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
// =====================
// import { useState, useEffect } from 'react';
// import { useCategories, useBills, useTokens } from '@/hooks/useEncryptedStorage';
// import { useAuth } from '@/hooks/useAuth';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { useProducts, useSettings } from "@/hooks/usePOSData";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Settings as SettingsSchema } from "../types/schema";
// import { Download, Upload, AlertTriangle, Save, Loader2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { encryptJSON, decryptJSON } from '@/utils/crypto';
// import { wipeAllData } from '@/utils/storage';

// import { migrateOfflineDataToOnline } from "@/services/migration/offlineToOnline";
// import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
// import { usePOSMode } from "@/context/POSModeContext";
// import type { OfferSettings } from "@/types/schema";
// import { DEFAULT_OFFER_SETTINGS } from "@/utils/defaultOfferSettings";
// import { mergeById } from "@/services/sync/mergeById";
// import { wipeFirebaseData } from "@/services/firestore/wipe";

// const mergeOffers = (
//   current: OfferSettings | undefined,
//   update: Partial<OfferSettings>
// ): OfferSettings => ({
//   ...DEFAULT_OFFER_SETTINGS,
//   ...current,
//   ...update,
// });

// export default function Settings() {
//   const { data: settings, setData: setSettings } = useSettings();
//   const { data: products, setData: setProducts } = useProducts();
//   const { data: categories, setData: setCategories } = useCategories();
//   const { data: bills, setData: setBills } = useBills();
//   const { data: tokens, setData: setTokens } = useTokens();
//   const { cryptoKey } = useAuth();
//   const { toast } = useToast();
//   const { user, userProfile, loading } = useFirebaseAuth();
//   const businessMode = userProfile?.businessMode;
//   const posMode = usePOSMode();
//   const isValidGST = (gst: string) => gst.length === 15;

//   const [formData, setFormData] = useState<SettingsSchema>(settings);
//   const [isWiping, setIsWiping] = useState(false);

//   useEffect(() => {
//     setFormData(settings);
//   }, [settings]);
//   const [showWipeDialog, setShowWipeDialog] = useState(false);
//   const [showImportDialog, setShowImportDialog] = useState(false);
//   const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
//   const [importFile, setImportFile] = useState<File | null>(null);

//   const handleSave = async () => {
//     const updated = {
//       ...formData,
//       updatedAt: Date.now(),
//     };

//     setFormData(updated);
//     await setSettings(updated);

//     toast({
//       title: 'Settings saved',
//       description: 'Your settings have been updated',
//     });
//   };

//   const handleExportBackup = async () => {
//     if (!cryptoKey) return;

//     try {
//       const backup = {
//         version: 1,
//         exportDate: new Date().toISOString(),
//         data: {
//           products,
//           categories,
//           bills,
//           settings: formData,
//           tokens,
//         },
//       };

//       const encrypted = await encryptJSON(cryptoKey, backup);
//       const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);

//       toast({
//         title: 'Backup exported',
//         description: 'Encrypted backup file has been downloaded',
//       });
//     } catch (error) {
//       console.error('Export error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Export failed',
//         description: 'Failed to create backup file',
//       });
//     }
//   };

//   const handleImportBackup = async () => {
//     if (!importFile || !cryptoKey) return;

//     try {
//       const fileContent = await importFile.text();
//       const encrypted = JSON.parse(fileContent);
//       const backup = await decryptJSON(cryptoKey, encrypted);

//       if (!backup?.data) {
//         throw new Error("Invalid backup file");
//       }

//       if (importMode === 'overwrite') {
//         const productsData = backup.data.products || [];
//         const categoriesData = backup.data.categories || [];
//         const billsData = backup.data.bills || [];
//         const settingsData = backup.data.settings ?? settings;
//         const tokensData = backup.data.tokens || tokens;

//         await Promise.all([
//           setProducts(productsData),
//           setCategories(categoriesData),
//           setBills(billsData),
//           setTokens(tokensData),
//         ]);

//         setFormData(settingsData);
//         await setSettings(settingsData);
//       } else {
//         // Merge using id + updatedAt safe mergeById
//         const mergedProducts = mergeById(
//           products,
//           backup.data.products || []
//         );

//         const mergedCategories = mergeById(
//           categories,
//           backup.data.categories || []
//         );

//         const mergedBills = mergeById(
//           bills,
//           backup.data.bills || []
//         );

//         await Promise.all([
//           setProducts(mergedProducts),
//           setCategories(mergedCategories),
//           setBills(mergedBills),
//           setTokens(backup.data.tokens || tokens),
//         ]);

//         const newSettings = backup.data.settings ?? settings;
//         setFormData(newSettings);
//         await setSettings(newSettings);
//       }

//       setShowImportDialog(false);
//       setImportFile(null);

//       toast({
//         title: 'Backup imported',
//         description: `Data has been ${importMode === 'overwrite' ? 'restored' : 'merged'}`,
//       });

//       setTimeout(() => window.location.reload(), 1000);
//     } catch (error) {
//       console.error('Import error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Import failed',
//         description: 'Failed to decrypt or import backup. Please ensure you entered the correct master password.',
//       });
//     }
//   };

//   const handleWipeData = async () => {
//     setIsWiping(true);
//     try {
//       // Always wipe local data first
//       wipeAllData();

//       // If online mode, also wipe Firebase data
//       if (posMode === "online" && user?.uid) {
//         try {
//           await wipeFirebaseData(user.uid);
//         } catch (firebaseError) {
//           console.error("Firebase wipe error:", firebaseError);
//           toast({
//             variant: 'destructive',
//             title: 'Cloud wipe failed',
//             description: 'Local data was wiped, but cloud data could not be deleted. Check your connection and try again.',
//           });
//           setTimeout(() => window.location.reload(), 2000);
//           return;
//         }
//       }

//       toast({
//         title: 'Data wiped',
//         description: posMode === "online"
//           ? 'All local and cloud data has been cleared. Reloading...'
//           : 'All local data has been cleared. Reloading...',
//       });
//       setTimeout(() => window.location.reload(), 1000);
//     } catch (error) {
//       console.error('Wipe error:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Wipe failed',
//         description: 'An error occurred while wiping data.',
//       });
//     } finally {
//       setIsWiping(false);
//     }
//   };

//   return (
//     <div className="p-6 lg:p-8 pb-24 max-w-2xl mx-auto space-y-8">
//       <h1 className="text-2xl font-semibold">Settings</h1>

//       {/* Shop Information */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Shop Information</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Shop Name</label>
//             <Input
//               value={formData.shopName}
//               onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
//               placeholder="Enter shop name"
//               className="h-12"
//               data-testid="input-shop-name"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Address</label>
//             <Input
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               placeholder="Enter shop address"
//               className="h-12"
//               data-testid="input-shop-address"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* GST Configuration */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">GST Configuration</h2>

//         <Card className="p-6 space-y-4">

//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Enable GST</label>
//             </div>
//             <Switch
//               checked={formData.gstOn}
//               onCheckedChange={(checked) =>
//                 setFormData({ ...formData, gstOn: checked })
//               }
//             />
//           </div>

//           {formData.gstOn && (
//             <>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Number
//                 </label>
//                 <Input
//                   placeholder="Enter GST Number (e.g. 22AAAAA0000A1Z5)"
//                   value={formData.gstNumber || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstNumber: e.target.value.toUpperCase(),
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Percentage
//                 </label>
//                 <Input
//                   type="number"
//                   value={formData.gstPercent}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstPercent: Number(e.target.value),
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Mode
//                 </label>
//                 <Select
//                   value={formData.gstMode}
//                   onValueChange={(v: "INCLUSIVE" | "EXCLUSIVE") =>
//                     setFormData({ ...formData, gstMode: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="EXCLUSIVE">
//                       GST Exclusive (Add above price)
//                     </SelectItem>
//                     <SelectItem value="INCLUSIVE">
//                       GST Inclusive (Included in price)
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">
//                   GST Type
//                 </label>
//                 <Select
//                   value={formData.gstType}
//                   onValueChange={(v: "CGST_SGST" | "IGST") =>
//                     setFormData({ ...formData, gstType: v })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="CGST_SGST">
//                       CGST + SGST
//                     </SelectItem>
//                     <SelectItem value="IGST">
//                       IGST
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </>
//           )}
//         </Card>
//       </div>

//       <Card className="p-6 space-y-4">
//         <h3 className="text-lg font-semibold">Customer Offers</h3>

//         {/* ENABLE OFFERS */}
//         <div className="flex items-center justify-between">
//           <span className="text-sm">Enable Offers</span>
//           <Switch
//             checked={formData.offers?.enabled ?? false}
//             onCheckedChange={(v) =>
//               setFormData({
//                 ...formData,
//                 offers: mergeOffers(formData.offers, { enabled: v }),
//               })
//             }
//           />
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-sm">Discount Apply Mode</span>

//           <select
//             className="border rounded px-2 py-1 text-sm bg-white text-black 
//                     dark:bg-zinc-900 dark:text-white 
//                     dark:border-zinc-600"
//             value={formData.offers?.applyMode ?? "AUTO"}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 offers: {
//                   ...formData.offers!,
//                   applyMode: e.target.value as "AUTO" | "MANUAL",
//                 },
//               })
//             }
//           >
//             <option value="AUTO">Automatic</option>
//             <option value="MANUAL">Manual (Coupon)</option>
//           </select>
//         </div>

//         {/* BILL AMOUNT OFFER */}
//         <div className="border rounded-md p-4 space-y-3">
//           <div className="flex items-center justify-between">
//             <h4 className="font-medium text-sm">Bill Amount Offer</h4>
//             <Switch
//               checked={formData.offers?.billAmountOffer?.enabled ?? false}
//               onCheckedChange={(v) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       enabled: v,
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <Input
//               type="number"
//               placeholder="Min Bill Amount"
//               value={formData.offers?.billAmountOffer?.minBillAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       minBillAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />

//             <Input
//               type="number"
//               placeholder="Next Bill Min Amount"
//               value={formData.offers?.billAmountOffer?.nextBillMinAmount ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       nextBillMinAmount: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <Input
//               type="number"
//               placeholder={
//                 formData.offers?.billAmountOffer?.discountType === "PERCENT"
//                   ? "Discount %"
//                   : "Discount ₹"
//               }
//               value={formData.offers?.billAmountOffer?.discountValue ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       discountValue: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />
//             <select
//               className="border rounded px-2 py-1 text-sm bg-white text-black 
//                     dark:bg-zinc-900 dark:text-white 
//                     dark:border-zinc-600"
//               value={formData.offers?.billAmountOffer?.discountType ?? "PERCENT"}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       discountType: e.target.value as "PERCENT" | "FLAT",
//                     },
//                   }),
//                 })
//               }
//             >
//               <option value="PERCENT">Percentage (%)</option>
//               <option value="FLAT">Flat Amount (₹)</option>
//             </select>

//             <Input
//               type="number"
//               placeholder="Coupon Valid Days (eg. 7, 15, 30)"
//               value={formData.offers?.billAmountOffer?.validDays ?? ""}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   offers: mergeOffers(formData.offers, {
//                     billAmountOffer: {
//                       ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer,
//                       validDays: Number(e.target.value),
//                     },
//                   }),
//                 })
//               }
//             />
//           </div>

//         </div>

//         {/* FOOTER TEXT */}
//         <Input
//           placeholder="Footer text (Bulk order / Party order etc)"
//           value={formData.offers?.footerText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 footerText: e.target.value,
//               }),
//             })
//           }
//         />

//         {/* FEEDBACK */}
//         <Input
//           placeholder="Feedback text"
//           value={formData.offers?.feedbackText ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackText: e.target.value,
//               }),
//             })
//           }
//         />

//         <Input
//           placeholder="Feedback link"
//           value={formData.offers?.feedbackLink ?? ""}
//           onChange={(e) =>
//             setFormData({
//               ...formData,
//               offers: mergeOffers(formData.offers, {
//                 feedbackLink: e.target.value,
//               }),
//             })
//           }
//         />
//       </Card>

//       <Card className="p-4">
//         <div className="flex justify-between">
//           <span className="text-sm font-medium py-1">Business Mode</span>
//           <span className="text-sm capitalize px-3 py-1 rounded-full 
//              bg-primary text-primary-foreground 
//              font-medium shadow-sm">{businessMode}</span>
//         </div>
//       </Card>

//       {businessMode === "restaurant" && (
//         <div className="space-y-4">
//           <h2 className="text-lg font-semibold">Restaurant Table Settings</h2>

//           <Card className="p-6 space-y-6">

//             {/* Table Count Controller */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="text-sm font-medium block">
//                   Number of Tables
//                 </label>
//                 <p className="text-xs text-muted-foreground">
//                   Total tables available in your restaurant
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.max(1, (formData.tableCount ?? 5) - 1),
//                     })
//                   }
//                 >
//                   -
//                 </Button>

//                 <div className="w-16 text-center text-lg font-semibold">
//                   {formData.tableCount ?? 5}
//                 </div>

//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: Math.min(100, (formData.tableCount ?? 5) + 1),
//                     })
//                   }
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>

//             {/* Quick Presets */}
//             <div className="flex flex-wrap gap-2">
//               {[10, 15, 20, 25, 30].map((n) => (
//                 <Button
//                   key={n}
//                   size="sm"
//                   variant={
//                     formData.tableCount === n ? "default" : "outline"
//                   }
//                   onClick={() =>
//                     setFormData({
//                       ...formData,
//                       tableCount: n,
//                     })
//                   }
//                 >
//                   {n} Tables
//                 </Button>
//               ))}
//             </div>

//           </Card>
//         </div>
//       )}

//       {/* Appearance */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Appearance</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Dark Mode</label>
//               <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
//             </div>
//             <Switch
//               checked={formData.theme === 'dark'}
//               onCheckedChange={async (checked) => {
//                 const newTheme: 'light' | 'dark' = checked ? 'dark' : 'light';
//                 const updated = { ...formData, theme: newTheme };
//                 setFormData(updated);
//                 await setSettings(updated);
//               }}
//               data-testid="switch-theme"
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">Primary Color</label>
//             <Select
//               value={formData.primaryColor}
//               onValueChange={async (value: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'custom') => {
//                 const updated = { ...formData, primaryColor: value };
//                 setFormData(updated);
//                 await setSettings(updated);
//               }}
//             >
//               <SelectTrigger className="h-12" data-testid="select-primary-color">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="blue">Blue</SelectItem>
//                 <SelectItem value="green">Green</SelectItem>
//                 <SelectItem value="yellow">Yellow</SelectItem>
//                 <SelectItem value="orange">Orange</SelectItem>
//                 <SelectItem value="red">Red</SelectItem>
//                 <SelectItem value="custom">Custom</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {formData.primaryColor === 'custom' && (
//             <div>
//               <label className="text-sm font-medium mb-2 block">Custom Color</label>
//               <div className="flex gap-2 items-center">
//                 <Input
//                   type="color"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   className="h-12 w-20"
//                   data-testid="input-custom-color"
//                 />
//                 <Input
//                   type="text"
//                   value={formData.customColor || '#ffdf00'}
//                   onChange={async (e) => {
//                     const updated = { ...formData, customColor: e.target.value };
//                     setFormData(updated);
//                     await setSettings(updated);
//                   }}
//                   placeholder="#ffdf00"
//                   className="h-12 flex-1"
//                   data-testid="input-custom-color-text"
//                 />
//               </div>
//             </div>
//           )}
//         </Card>
//       </div>

//       {/* Display Options */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Display Options</h2>
//         <Card className="p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="text-sm font-medium block">Show Token Numbers</label>
//               <p className="text-xs text-muted-foreground">Display tokens on bills</p>
//             </div>
//             <Switch
//               checked={formData.tokenVisible}
//               onCheckedChange={(checked) => setFormData({ ...formData, tokenVisible: checked })}
//               data-testid="switch-token-visible"
//             />
//           </div>
//         </Card>
//       </div>

//       {/* Print Settings */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Print Settings</h2>
//         <Card className="p-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">Print Layout</label>
//             <Select
//               value={formData.printLayout}
//               onValueChange={(value: 'A4' | '58mm' | '80mm') => setFormData({ ...formData, printLayout: value })}
//             >
//               <SelectTrigger className="h-12" data-testid="select-print-layout">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="A4">A4 Paper</SelectItem>
//                 <SelectItem value="58mm">58mm Receipt</SelectItem>
//                 <SelectItem value="80mm">80mm Receipt</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </Card>
//       </div>

//       {/* Save Button */}
//       <Button className="w-full h-12" onClick={handleSave} data-testid="button-save-settings">
//         <Save className="h-5 w-5 mr-2" />
//         Save Settings
//       </Button>

//       {/* Data Management */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Data Management</h2>

//         <Card className="p-6 space-y-3">

//           {/* ONLY FOR ONLINE POS */}
//           {posMode === "online" && (
//             <Button
//               variant="outline"
//               className="w-full justify-start h-12"
//               onClick={async () => {
//                 if (!user) return;

//                 await migrateOfflineDataToOnline(user.uid, {
//                   products,
//                   categories,
//                   bills,
//                   settings: formData,
//                 });

//                 toast({
//                   title: "Upload complete",
//                   description: "Offline data uploaded to cloud",
//                 });
//               }}
//             >
//               Upload Offline Data to Cloud
//             </Button>
//           )}

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={handleExportBackup}
//           >
//             <Download className="h-5 w-5 mr-2" />
//             Export Encrypted Backup
//           </Button>

//           <Button
//             variant="outline"
//             className="w-full justify-start h-12"
//             onClick={() => setShowImportDialog(true)}
//           >
//             <Upload className="h-5 w-5 mr-2" />
//             Import Encrypted Backup
//           </Button>

//         </Card>
//       </div>

//       {/* Danger Zone */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
//         <Card className="p-6 border-destructive">
//           <div className="flex items-start gap-4">
//             <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
//             <div className="flex-1">
//               <h3 className="font-semibold mb-1">Wipe All Data</h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 {posMode === "online"
//                   ? "This will permanently delete all products, categories, bills, and settings from both this device AND the cloud. This action cannot be undone."
//                   : "This will permanently delete all products, categories, bills, and settings from this device only. Cloud data (if any) will NOT be affected. This action cannot be undone."}
//               </p>
//               <Button
//                 variant="destructive"
//                 onClick={() => setShowWipeDialog(true)}
//                 disabled={isWiping}
//                 data-testid="button-wipe-data"
//               >
//                 Wipe All Data
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Wipe Confirmation Dialog */}
//       <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
//         <DialogContent data-testid="dialog-wipe-confirm">
//           <DialogHeader>
//             <DialogTitle>Confirm Data Wipe</DialogTitle>
//             <DialogDescription>
//               {posMode === "online"
//                 ? "Are you absolutely sure? This will delete all your data including products, categories, bills, and settings from BOTH this device AND the cloud. This action cannot be undone."
//                 : "Are you absolutely sure? This will delete all your data including products, categories, bills, and settings from this device. Cloud data will not be affected. This action cannot be undone."}
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowWipeDialog(false)}
//               disabled={isWiping}
//               data-testid="button-cancel-wipe"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleWipeData}
//               disabled={isWiping}
//               data-testid="button-confirm-wipe"
//             >
//               {isWiping ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Wiping...
//                 </>
//               ) : (
//                 "Yes, Wipe All Data"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Import Dialog */}
//       <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
//         <DialogContent data-testid="dialog-import-backup">
//           <DialogHeader>
//             <DialogTitle>Import Backup</DialogTitle>
//             <DialogDescription>
//               Select a backup file and choose how to import it
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">Backup File</label>
//               <Input
//                 type="file"
//                 accept=".json"
//                 onChange={(e) => setImportFile(e.target.files?.[0] || null)}
//                 data-testid="input-import-file"
//               />
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Import Mode</label>
//               <Select
//                 value={importMode}
//                 onValueChange={(value: 'merge' | 'overwrite') => setImportMode(value)}
//               >
//                 <SelectTrigger data-testid="select-import-mode">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="merge">Merge with existing data</SelectItem>
//                   <SelectItem value="overwrite">Overwrite all data</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowImportDialog(false);
//                 setImportFile(null);
//               }}
//               data-testid="button-cancel-import"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleImportBackup}
//               disabled={!importFile}
//               data-testid="button-confirm-import"
//             >
//               Import
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useCategories, useBills, useTokens } from '@/hooks/useEncryptedStorage';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useProducts, useSettings } from "@/hooks/usePOSData";

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
import { Settings as SettingsSchema } from "../types/schema";
import { Download, Upload, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { encryptJSON, decryptJSON } from '@/utils/crypto';
import { wipeAllData } from '@/utils/storage';

import { migrateOfflineDataToOnline } from "@/services/migration/offlineToOnline";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { usePOSMode } from "@/context/POSModeContext";
import type { OfferSettings } from "@/types/schema";
import { DEFAULT_OFFER_SETTINGS } from "@/utils/defaultOfferSettings";
import { mergeById } from "@/services/sync/mergeById";
import { wipeFirebaseData } from "@/services/firestore/wipe";

const mergeOffers = (
  current: OfferSettings | undefined,
  update: Partial<OfferSettings>
): OfferSettings => ({
  ...DEFAULT_OFFER_SETTINGS,
  ...current,
  ...update,
});

export default function Settings() {
  const { data: settings, setData: setSettings } = useSettings();
  const { data: products, setData: setProducts } = useProducts();
  const { data: categories, setData: setCategories } = useCategories();
  const { data: bills, setData: setBills } = useBills();
  const { data: tokens, setData: setTokens } = useTokens();
  const { cryptoKey } = useAuth();
  const { toast } = useToast();
  const { user, userProfile, loading } = useFirebaseAuth();
  const businessMode = userProfile?.businessMode;
  const posMode = usePOSMode();
  const isValidGST = (gst: string) => gst.length === 15;

  const [formData, setFormData] = useState<SettingsSchema>(settings);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSave = async () => {
    const updated = {
      ...formData,
      updatedAt: Date.now(),
    };

    setFormData(updated);
    await setSettings(updated);

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
          settings: formData,
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

      if (!backup?.data) {
        throw new Error("Invalid backup file");
      }

      if (importMode === 'overwrite') {
        const productsData = backup.data.products || [];
        const categoriesData = backup.data.categories || [];
        const billsData = backup.data.bills || [];
        const settingsData = backup.data.settings ?? settings;
        const tokensData = backup.data.tokens || tokens;

        await Promise.all([
          setProducts(productsData),
          setCategories(categoriesData),
          setBills(billsData),
          setTokens(tokensData),
        ]);

        setFormData(settingsData);
        await setSettings(settingsData);

        // Online overwrite: wipe Firebase first, then upload imported data
      if (posMode === "online" && user?.uid) {
        try {
          await wipeFirebaseData(user.uid);
        } catch (firebaseError) {
          console.error("Firebase wipe before import error:", firebaseError);
        }
        try {
          await migrateOfflineDataToOnline(user.uid, {
            products: productsData,
            categories: categoriesData,
            bills: billsData,
            settings: settingsData,
          });
        } catch (uploadError) {
          console.error("Firebase upload after import error:", uploadError);
        }
      }
      } else {
        const mergedProducts = mergeById(products, backup.data.products || []);
        const mergedCategories = mergeById(categories, backup.data.categories || []);
        const mergedBills = mergeById(bills, backup.data.bills || []);

        await Promise.all([
          setProducts(mergedProducts),
          setCategories(mergedCategories),
          setBills(mergedBills),
          setTokens(backup.data.tokens || tokens),
        ]);

        const newSettings = backup.data.settings ?? settings;
        setFormData(newSettings);
        await setSettings(newSettings);
      }

      setShowImportDialog(false);
      setImportFile(null);

      toast({
        title: 'Backup imported',
        description: `Data has been ${importMode === 'overwrite' ? 'restored' : 'merged'}`,
      });

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

  const handleWipeData = async () => {
    setIsWiping(true);
    try {
      wipeAllData();

      if (posMode === "online" && user?.uid) {
        try {
          await wipeFirebaseData(user.uid);
        } catch (firebaseError) {
          console.error("Firebase wipe error:", firebaseError);
          toast({
            variant: 'destructive',
            title: 'Cloud wipe failed',
            description: 'Local data was wiped, but cloud data could not be deleted. Check your connection and try again.',
          });
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
      }

      toast({
        title: 'Data wiped',
        description: posMode === "online"
          ? 'All local and cloud data has been cleared. Reloading...'
          : 'All local data has been cleared. Reloading...',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Wipe error:', error);
      toast({
        variant: 'destructive',
        title: 'Wipe failed',
        description: 'An error occurred while wiping data.',
      });
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 pb-24 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">GST Configuration</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div><label className="text-sm font-medium block">Enable GST</label></div>
            <Switch checked={formData.gstOn} onCheckedChange={(checked) => setFormData({ ...formData, gstOn: checked })} />
          </div>
          {formData.gstOn && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">GST Number</label>
                <Input placeholder="Enter GST Number (e.g. 22AAAAA0000A1Z5)" value={formData.gstNumber || ""} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">GST Percentage</label>
                <Input type="number" value={formData.gstPercent} onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">GST Mode</label>
                <Select value={formData.gstMode} onValueChange={(v: "INCLUSIVE" | "EXCLUSIVE") => setFormData({ ...formData, gstMode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCLUSIVE">GST Exclusive (Add above price)</SelectItem>
                    <SelectItem value="INCLUSIVE">GST Inclusive (Included in price)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">GST Type</label>
                <Select value={formData.gstType} onValueChange={(v: "CGST_SGST" | "IGST") => setFormData({ ...formData, gstType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CGST_SGST">CGST + SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Customer Offers</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm">Enable Offers</span>
          <Switch checked={formData.offers?.enabled ?? false} onCheckedChange={(v) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { enabled: v }) })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Discount Apply Mode</span>
          <select className="border rounded px-2 py-1 text-sm bg-white text-black dark:bg-zinc-900 dark:text-white dark:border-zinc-600" value={formData.offers?.applyMode ?? "AUTO"} onChange={(e) => setFormData({ ...formData, offers: { ...formData.offers!, applyMode: e.target.value as "AUTO" | "MANUAL" } })}>
            <option value="AUTO">Automatic</option>
            <option value="MANUAL">Manual (Coupon)</option>
          </select>
        </div>
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Bill Amount Offer</h4>
            <Switch checked={formData.offers?.billAmountOffer?.enabled ?? false} onCheckedChange={(v) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, enabled: v } }) })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Min Bill Amount" value={formData.offers?.billAmountOffer?.minBillAmount ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, minBillAmount: Number(e.target.value) } }) })} />
            <Input type="number" placeholder="Next Bill Min Amount" value={formData.offers?.billAmountOffer?.nextBillMinAmount ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, nextBillMinAmount: Number(e.target.value) } }) })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder={formData.offers?.billAmountOffer?.discountType === "PERCENT" ? "Discount %" : "Discount ₹"} value={formData.offers?.billAmountOffer?.discountValue ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, discountValue: Number(e.target.value) } }) })} />
            <select className="border rounded px-2 py-1 text-sm bg-white text-black dark:bg-zinc-900 dark:text-white dark:border-zinc-600" value={formData.offers?.billAmountOffer?.discountType ?? "PERCENT"} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, discountType: e.target.value as "PERCENT" | "FLAT" } }) })}>
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
            </select>
            <Input type="number" placeholder="Coupon Valid Days (eg. 7, 15, 30)" value={formData.offers?.billAmountOffer?.validDays ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { billAmountOffer: { ...(formData.offers ?? DEFAULT_OFFER_SETTINGS).billAmountOffer, validDays: Number(e.target.value) } }) })} />
          </div>
        </div>
        <Input placeholder="Footer text (Bulk order / Party order etc)" value={formData.offers?.footerText ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { footerText: e.target.value }) })} />
        <Input placeholder="Feedback text" value={formData.offers?.feedbackText ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { feedbackText: e.target.value }) })} />
        <Input placeholder="Feedback link" value={formData.offers?.feedbackLink ?? ""} onChange={(e) => setFormData({ ...formData, offers: mergeOffers(formData.offers, { feedbackLink: e.target.value }) })} />
      </Card>

      <Card className="p-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium py-1">Business Mode</span>
          <span className="text-sm capitalize px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium shadow-sm">{businessMode}</span>
        </div>
      </Card>

      {businessMode === "restaurant" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Restaurant Table Settings</h2>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium block">Number of Tables</label>
                <p className="text-xs text-muted-foreground">Total tables available in your restaurant</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setFormData({ ...formData, tableCount: Math.max(1, (formData.tableCount ?? 5) - 1) })}>-</Button>
                <div className="w-16 text-center text-lg font-semibold">{formData.tableCount ?? 5}</div>
                <Button variant="outline" size="icon" onClick={() => setFormData({ ...formData, tableCount: Math.min(100, (formData.tableCount ?? 5) + 1) })}>+</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 25, 30].map((n) => (
                <Button key={n} size="sm" variant={formData.tableCount === n ? "default" : "outline"} onClick={() => setFormData({ ...formData, tableCount: n })}>{n} Tables</Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Dark Mode</label>
              <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
            </div>
            <Switch checked={formData.theme === 'dark'} onCheckedChange={async (checked) => { const newTheme: 'light' | 'dark' = checked ? 'dark' : 'light'; const updated = { ...formData, theme: newTheme }; setFormData(updated); await setSettings(updated); }} data-testid="switch-theme" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Primary Color</label>
            <Select value={formData.primaryColor} onValueChange={async (value: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'custom') => { const updated = { ...formData, primaryColor: value }; setFormData(updated); await setSettings(updated); }}>
              <SelectTrigger className="h-12" data-testid="select-primary-color"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.primaryColor === 'custom' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={formData.customColor || '#ffdf00'} onChange={async (e) => { const updated = { ...formData, customColor: e.target.value }; setFormData(updated); await setSettings(updated); }} className="h-12 w-20" data-testid="input-custom-color" />
                <Input type="text" value={formData.customColor || '#ffdf00'} onChange={async (e) => { const updated = { ...formData, customColor: e.target.value }; setFormData(updated); await setSettings(updated); }} placeholder="#ffdf00" className="h-12 flex-1" data-testid="input-custom-color-text" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Display Options</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium block">Show Token Numbers</label>
              <p className="text-xs text-muted-foreground">Display tokens on bills</p>
            </div>
            <Switch checked={formData.tokenVisible} onCheckedChange={(checked) => setFormData({ ...formData, tokenVisible: checked })} data-testid="switch-token-visible" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Print Settings</h2>
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Print Layout</label>
            <Select value={formData.printLayout} onValueChange={(value: 'A4' | '58mm' | '80mm') => setFormData({ ...formData, printLayout: value })}>
              <SelectTrigger className="h-12" data-testid="select-print-layout"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 Paper</SelectItem>
                <SelectItem value="58mm">58mm Receipt</SelectItem>
                <SelectItem value="80mm">80mm Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Button className="w-full h-12" onClick={handleSave} data-testid="button-save-settings">
        <Save className="h-5 w-5 mr-2" />
        Save Settings
      </Button>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
        <Card className="p-6 space-y-3">
          {posMode === "online" && (
            <Button variant="outline" className="w-full justify-start h-12" onClick={async () => {
              if (!user) return;
              await migrateOfflineDataToOnline(user.uid, { products, categories, bills, settings: formData });
              toast({ title: "Upload complete", description: "Offline data uploaded to cloud" });
            }}>
              Upload Offline Data to Cloud
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start h-12" onClick={handleExportBackup}>
            <Download className="h-5 w-5 mr-2" />
            Export Encrypted Backup
          </Button>
          <Button variant="outline" className="w-full justify-start h-12" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-5 w-5 mr-2" />
            Import Encrypted Backup
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Wipe All Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {posMode === "online"
                  ? "This will permanently delete all products, categories, bills, and settings from both this device AND the cloud. This action cannot be undone."
                  : "This will permanently delete all products, categories, bills, and settings from this device only. Cloud data (if any) will NOT be affected. This action cannot be undone."}
              </p>
              <Button variant="destructive" onClick={() => setShowWipeDialog(true)} disabled={isWiping} data-testid="button-wipe-data">
                Wipe All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={showWipeDialog} onOpenChange={setShowWipeDialog}>
        <DialogContent data-testid="dialog-wipe-confirm">
          <DialogHeader>
            <DialogTitle>Confirm Data Wipe</DialogTitle>
            <DialogDescription>
              {posMode === "online"
                ? "Are you absolutely sure? This will delete all your data including products, categories, bills, and settings from BOTH this device AND the cloud. This action cannot be undone."
                : "Are you absolutely sure? This will delete all your data including products, categories, bills, and settings from this device. Cloud data will not be affected. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWipeDialog(false)} disabled={isWiping} data-testid="button-cancel-wipe">Cancel</Button>
            <Button variant="destructive" onClick={handleWipeData} disabled={isWiping} data-testid="button-confirm-wipe">
              {isWiping ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Wiping...</>) : "Yes, Wipe All Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent data-testid="dialog-import-backup">
          <DialogHeader>
            <DialogTitle>Import Backup</DialogTitle>
            <DialogDescription>Select a backup file and choose how to import it</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Backup File</label>
              <Input type="file" accept=".json" onChange={(e) => setImportFile(e.target.files?.[0] || null)} data-testid="input-import-file" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Import Mode</label>
              <Select value={importMode} onValueChange={(value: 'merge' | 'overwrite') => setImportMode(value)}>
                <SelectTrigger data-testid="select-import-mode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge with existing data</SelectItem>
                  <SelectItem value="overwrite">Overwrite all data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportFile(null); }} data-testid="button-cancel-import">Cancel</Button>
            <Button onClick={handleImportBackup} disabled={!importFile} data-testid="button-confirm-import">Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}