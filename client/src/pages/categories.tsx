// import { useState } from 'react';
// import { useCategories } from "@/hooks/usePOSData";
// import { useProducts } from "@/hooks/usePOSData";

// import { Category, InsertCategory, Bill, Product } from "@/types/schema";

// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
// import { nanoid } from 'nanoid';
// import { useToast } from '@/hooks/use-toast';
// import { ConfirmDialog } from "@/components/ConfirmDialog";

// export default function Categories() {
//   // const { data: categories, setData: setCategories, isLoading } = useCategories();
//   const { data: products, setData: setProducts } = useProducts();
//   const { toast } = useToast();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
//   const [formData, setFormData] = useState<InsertCategory>({ name: '' });
//   const {data: categories,addOrUpdateCategory,deleteCategory,isLoading,} = useCategories();
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   const handleAdd = () => {
//     setEditingCategory(null);
//     setFormData({ name: '' });
//     setIsDialogOpen(true);
//   };

//   const handleEdit = (category: Category) => {
//     setEditingCategory(category);
//     setFormData({ name: category.name });
//     setIsDialogOpen(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Invalid input",
//         description: "Please enter a category name",
//       });
//       return;
//     }

//     // ✅ 1️⃣ CLOSE DIALOG FIRST (IMPORTANT)
//     setIsDialogOpen(false);
//     setEditingCategory(null);
//     setFormData({ name: "" });

//     try {
//       if (editingCategory) {
//         await addOrUpdateCategory({
//           ...editingCategory,
//           name: formData.name,
//           updatedAt: Date.now(),
//         });

//         toast({
//           title: "Category updated",
//           description: `${formData.name} has been updated`,
//         });
//       } else {
//         await addOrUpdateCategory({
//           id: nanoid(),
//           name: formData.name,
//           updatedAt: Date.now(),
//         });

//         toast({
//           title: "Category added",
//           description: `${formData.name} has been added`,
//         });
//       }
//     } catch (err) {
//       toast({
//         variant: "destructive",
//         title: "Failed",
//         description: "Something went wrong",
//       });
//     }
//   };

//   // const getProductCount = (categoryId: string) => {
//   //   return products.filter((p: Product) => p.categoryId === categoryId).length;
//   // };
//   const getProductCount = (categoryId: string) => {
//   return products.filter(
//     (p) => p.categoryId === categoryId && !p.isDeleted
//   ).length;
// };


//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-muted-foreground">Loading categories...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Categories</h1>
//         <Button onClick={handleAdd} data-testid="button-add-category">
//           <Plus className="h-5 w-5 mr-2" />
//           Add Category
//         </Button>
//       </div>

//       {categories.length === 0 ? (
//         <Card className="p-12">
//           <div className="text-center">
//             <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//             <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
//             <p className="text-muted-foreground mb-4">
//               Create categories to organize your products
//             </p>
//             <Button onClick={handleAdd}>
//               <Plus className="h-5 w-5 mr-2" />
//               Add Category
//             </Button>
//           </div>
//         </Card>
//       ) : (
//         <Card className="overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b bg-muted/50">
//                   <th className="text-left px-4 py-3 text-sm font-semibold">Name</th>
//                   <th className="text-right px-4 py-3 text-sm font-semibold">Products</th>
//                   <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {categories.map((category: Category) => (
//                   <tr
//                     key={category.id}
//                     className="border-b hover-elevate"
//                     data-testid={`category-row-${category.id}`}
//                   >
//                     <td className="px-4 py-3 font-medium">{category.name}</td>
//                     <td className="px-4 py-3 text-right text-sm text-muted-foreground">
//                       {getProductCount(category.id)} item{getProductCount(category.id) !== 1 ? 's' : ''}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleEdit(category)}
//                           data-testid={`button-edit-${category.id}`}
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         {/* <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleDelete(category.id)}
//                           data-testid={`button-delete-${category.id}`}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button> */}
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => setDeleteId(category.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//       )}


//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent
//           data-testid="dialog-category-form"
//           onOpenAutoFocus={(e) => e.preventDefault()}
//           onCloseAutoFocus={(e) => e.preventDefault()}
//         >
//           <DialogHeader>
//             <DialogTitle>
//               {editingCategory ? "Edit Category" : "Add Category"}
//             </DialogTitle>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Category Name <span className="text-destructive">*</span>
//               </label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) => setFormData({ name: e.target.value })}
//                 placeholder="Enter category name"
//                 className="h-12"
//                 required
//               />
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setIsDialogOpen(false);
//                   setEditingCategory(null);
//                   setFormData({ name: "" });
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {editingCategory ? "Update" : "Add"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <ConfirmDialog
//   open={!!deleteId}
//   title="Delete Category"
//   description="Is category ko delete karne se related products par effect pad sakta hai."
//   onCancel={() => setDeleteId(null)}
//   onConfirm={() => {
//     const id = deleteId;
//     setDeleteId(null); // ✅ CLOSE FIRST

//     if (!id) return;

//     // const productsInCategory = products.filter(
//     //   (p) => p.categoryId === id
//     // );
//     const productsInCategory = products.filter(
//       (p) => p.categoryId === id && !p.isDeleted
//     );

//     if (productsInCategory.length > 0) {
//       toast({
//         variant: "destructive",
//         title: "Cannot delete",
//         description: `This category has ${productsInCategory.length} product(s). Remove them first.`,
//       });
//       return;
//     }

//     (async () => {
//       try {
//         await deleteCategory(id);

//         toast({
//           title: "Category deleted",
//           description: "The category has been removed",
//         });
//       } catch {
//         toast({
//           variant: "destructive",
//           title: "Delete failed",
//           description: "Something went wrong",
//         });
//       }
//     })();
//   }}
// />



//     </div>
//   );
// }

// client/src/pages/categories.tsx
import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/usePOSData";
import { useProducts } from "@/hooks/usePOSData";
import { usePOSMode } from "@/context/POSModeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { writeCategoryOnline } from "@/services/firestore/categories";

import { Category, InsertCategory, Product } from "@/types/schema";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function Categories() {
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();

  const { data: products } = useProducts();
  const { toast } = useToast();

  const {
    data: categories,
    setData: setCategoriesData,
    isLoading,
  } = useCategories();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<InsertCategory>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ================= FILTER (SOFT DELETE) ================= */
  const visibleCategories = useMemo(
    () => categories.filter((c) => !c.isDeleted),
    [categories]
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter a category name",
      });
      return;
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "" });

    try {
      if (editingCategory) {
        const updatedCategory: Category = {
          ...editingCategory,
          name: formData.name,
          updatedAt: Date.now(),
          isSynced: false,
        };

        // Compute new local state from current closure
        const newLocalState = categories.map((c) =>
          c.id === editingCategory.id ? updatedCategory : c
        );

        // Write to local FIRST (immediate UI update)
        await setCategoriesData(newLocalState);

        // Try Firebase write
        if (mode === "online" && user) {
          try {
            await writeCategoryOnline(user.uid, updatedCategory);
            // Mark synced in the computed state (avoids stale closure)
            const syncedState = newLocalState.map((c) =>
              c.id === updatedCategory.id ? { ...c, isSynced: true } : c
            );
            await setCategoriesData(syncedState);
          } catch (e) {
            console.error("Category online write failed (will retry on reconnect)", e);
          }
        }

        toast({
          title: "Category updated",
          description: `${formData.name} has been updated`,
        });
      } else {
        const newCategory: Category = {
          id: nanoid(),
          name: formData.name,
          updatedAt: Date.now(),
          isSynced: false,
        };

        // Compute new local state from current closure
        const newLocalState = [...categories, newCategory];

        // Write to local FIRST (immediate UI update)
        await setCategoriesData(newLocalState);

        // Try Firebase write
        if (mode === "online" && user) {
          try {
            await writeCategoryOnline(user.uid, newCategory);
            // Mark synced in the computed state (avoids stale closure)
            const syncedState = newLocalState.map((c) =>
              c.id === newCategory.id ? { ...c, isSynced: true } : c
            );
            await setCategoriesData(syncedState);
          } catch (e) {
            console.error("Category online write failed (will retry on reconnect)", e);
          }
        }

        toast({
          title: "Category added",
          description: `${formData.name} has been added`,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Something went wrong",
      });
    }
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(
      (p) => p.categoryId === categoryId && !p.isDeleted
    ).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={handleAdd} data-testid="button-add-category">
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      {visibleCategories.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Create categories to organize your products
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Name</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Products</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b hover-elevate"
                    data-testid={`category-row-${category.id}`}
                  >
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {getProductCount(category.id)} item{getProductCount(category.id) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          data-testid={`button-edit-${category.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          data-testid="dialog-category-form"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter category name"
                className="h-12"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingCategory(null);
                  setFormData({ name: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        description="Is category ko delete karne se related products par effect pad sakta hai."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          const id = deleteId;
          setDeleteId(null);

          if (!id) return;

          const productsInCategory = products.filter(
            (p) => p.categoryId === id && !p.isDeleted
          );

          if (productsInCategory.length > 0) {
            toast({
              variant: "destructive",
              title: "Cannot delete",
              description: `This category has ${productsInCategory.length} product(s). Remove them first.`,
            });
            return;
          }

          // Find the category from FULL list (including soft-deleted) to preserve all fields
          const category = categories.find((c) => c.id === id);
          if (!category) return;

          // Soft delete: mark isDeleted=true
          const softDeleted: Category = {
            ...category,
            isDeleted: true,
            deletedAt: Date.now(),
            updatedAt: Date.now(),
            isSynced: false,
          };

          // Compute new local state from current closure
          const newLocalState = categories.map((c) =>
            c.id === id ? softDeleted : c
          );

          (async () => {
            // Write to local FIRST (immediate UI update)
            await setCategoriesData(newLocalState);

            // Try Firebase write
            if (mode === "online" && user) {
              try {
                await writeCategoryOnline(user.uid, softDeleted);
                // Mark synced in the computed state (avoids stale closure)
                const syncedState = newLocalState.map((c) =>
                  c.id === softDeleted.id ? { ...c, isSynced: true } : c
                );
                await setCategoriesData(syncedState);
              } catch (e) {
                console.error("Category delete sync failed (will retry on reconnect)", e);
              }
            }

            toast({
              title: "Category deleted",
              description: "The category has been removed",
            });
          })();
        }}
      />
    </div>
  );
}