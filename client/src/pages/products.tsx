// import { useState, useMemo } from "react";
// import { useCategories } from "@/hooks/usePOSData";
// import { useProducts } from "@/hooks/usePOSData";

// import { Product, Category, InsertProduct } from "@/types/schema";

// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { Plus, Edit, Trash2, Package } from "lucide-react";
// import { nanoid } from "nanoid";
// import { useToast } from "@/hooks/use-toast";
// import { ConfirmDialog } from "@/components/ConfirmDialog";

// export default function Products() {
//   const {
//     data: products,
//     setData: setProducts,
//     isLoading,
//     updateProductOnline,
//   } = useProducts();

//   const { data: categories } = useCategories();
//   const { toast } = useToast();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);

//   const [formData, setFormData] = useState<InsertProduct>({
//     name: "",
//     price: 0,
//     categoryId: "",
//   });
//   const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);


//   /* ================= FILTER (SOFT DELETE) ================= */
//   const visibleProducts = useMemo(
//     () => products.filter((p) => !p.isDeleted),
//     [products]
//   );

//   /* ================= ADD / EDIT ================= */
//   const handleAdd = () => {
//     setEditingProduct(null);
//     setFormData({
//       name: "",
//       price: 0,
//       categoryId: categories[0]?.id || "",
//     });
//     setIsDialogOpen(true);
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       price: product.price,
//       categoryId: product.categoryId,
//     });
//     setIsDialogOpen(true);
//   };

//   /* ================= SOFT DELETE ================= */
//   const handleDelete = async (product: Product) => {
//     if (!confirm("Are you sure you want to delete this product?")) return;

//     const deletedProduct: Product = {
//       ...product,
//       isDeleted: true,
//       deletedAt: Date.now(),
//       updatedAt: Date.now(),
//     };

//     const updated = products.map((p) =>
//       p.id === product.id ? deletedProduct : p
//     );

//     // local
//     await setProducts(updated);

//     // online (same write API)
//     await updateProductOnline(deletedProduct);

//     toast({
//       title: "Product deleted",
//       description: "Product has been removed safely",
//     });
//   };

//   /* ================= SAVE ================= */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name || !formData.categoryId || formData.price <= 0) {
//       toast({
//         variant: "destructive",
//         title: "Invalid input",
//         description: "Please fill all fields correctly",
//       });
//       return;
//     }

// setIsDialogOpen(false);
// setEditingProduct(null);

// try {
//   if (editingProduct) {
//     const updatedProduct: Product = {
//       ...editingProduct,
//       ...formData,
//       updatedAt: Date.now(),
//     };

//     const updated = products.map((p) =>
//       p.id === editingProduct.id ? updatedProduct : p
//     );

//     await setProducts(updated);
//     await updateProductOnline(updatedProduct);

//     toast({
//       title: "Product updated",
//       description: `${formData.name} updated`,
//     });
//   } else {
//     const newProduct: Product = {
//       id: nanoid(),
//       ...formData,
//       addCount: 0,
//       updatedAt: Date.now(),
//       isDeleted: false,
//       isSynced: false
//     };

//     await setProducts([...products, newProduct]);
//     await updateProductOnline(newProduct);

//     toast({
//       title: "Product added",
//       description: `${formData.name} added`,
//     });
//   }
// } catch {
//   toast({
//     variant: "destructive",
//     title: "Failed",
//     description: "Something went wrong",
//   });
// }

// // reset form
// setFormData({ name: "", price: 0, categoryId: "" });


//   };

//   const getCategoryName = (id: string) =>
//     categories.find((c: Category) => c.id === id)?.name || "Unknown";

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-muted-foreground">Loading products...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* <div className="flex items-center justify-between"> */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-2xl font-semibold">Products</h1>

//         <Button
//             className="w-full sm:w-auto"
//           onClick={() => {
//             if (categories.length === 0) {
//               toast({
//                 variant: "destructive",
//                 title: "No category found",
//                 description: "Please add a category before adding products",
//               });
//               return;
//             }
//             handleAdd();
//           }}
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           Add Product
//         </Button>

//       </div>

//       {visibleProducts.length === 0 ? (

//         <Card className="p-12 text-center">
//           <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//           <h3 className="text-lg font-semibold mb-2">No products yet</h3>
//           <p className="text-muted-foreground mb-4">
//             Add a product to start billing
//           </p>
//           <Button
//             onClick={() => {
//               if (categories.length === 0) {
//                 toast({
//                   variant: "destructive",
//                   title: "No category found",
//                   description: "Please add a category first",
//                 });
//                 return;
//               }
//               handleAdd();
//             }}
//           >
//             <Plus className="h-5 w-5 mr-2" />
//             Add Product
//           </Button>
//         </Card>
//       ) : (

//         <Card className="overflow-x-auto">
//           <table className="w-full text-sm table-auto">
//             <thead>
//               <tr className="border-b bg-muted/50">
//                 <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">
//                   Name
//                 </th>
//                 <th className="px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">
//                   Category
//                 </th>
//                 <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">
//                   Price
//                 </th>
//                 <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {visibleProducts.map((product) => (
//                 <tr key={product.id} className="border-b">
//                   {/* Product Name */}
//                   <td className="px-2 sm:px-4 py-3">
//                     <div className="font-medium break-words leading-snug">
//                       {product.name}
//                     </div>

//                     {/* Mobile me category neeche dikhe */}
//                     <div className="text-xs text-muted-foreground sm:hidden">
//                       {getCategoryName(product.categoryId)}
//                     </div>
//                   </td>

//                   {/* Desktop Category */}
//                   <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
//                     {getCategoryName(product.categoryId)}
//                   </td>

//                   {/* Price */}
//                   <td className="px-2 sm:px-4 py-3 text-right font-semibold whitespace-nowrap">
//                     ₹{product.price.toFixed(2)}
//                   </td>

//                   {/* Actions */}
//                   <td className="px-2 sm:px-4 py-3 text-right">
//                     <div className="flex justify-end gap-1 sm:gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleEdit(product)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>

//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setDeleteProduct(product)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Card>


//       )}

//       {/* ADD / EDIT MODAL */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {editingProduct ? "Edit Product" : "Add Product"}
//             </DialogTitle>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <Input
//               placeholder="Product name"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               required
//             />

//             <Select
//               value={formData.categoryId}
//               onValueChange={(v) =>
//                 setFormData({ ...formData, categoryId: v })
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((c) => (
//                   <SelectItem key={c.id} value={c.id}>
//                     {c.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Input
//               type="number"
//               step="0.01"
//               value={formData.price}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   price: parseFloat(e.target.value) || 0,
//                 })
//               }
//               required
//             />

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {editingProduct ? "Update" : "Add"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <ConfirmDialog
//         open={!!deleteProduct}
//         title="Delete Product"
//         description="Is product ko delete karne ke baad billing me use nahi hoga."
//         onCancel={() => setDeleteProduct(null)}
//         onConfirm={() => {
//           const p = deleteProduct;
//           setDeleteProduct(null); // ✅ CLOSE FIRST (NO FLICKER)

//           if (!p) return;

//           const deletedProduct: Product = {
//             ...p,
//             isDeleted: true,
//             deletedAt: Date.now(),
//             updatedAt: Date.now(),
//           };

//           const updated = products.map((x) =>
//             x.id === p.id ? deletedProduct : x
//           );

//           (async () => {
//             await setProducts(updated);
//             await updateProductOnline(deletedProduct);

//             toast({
//               title: "Product deleted",
//               description: "Product removed safely",
//             });
//           })();
//         }}
//       />

//     </div>
//   );
// }

// ─── FILE: client/src/pages/products.tsx ───────────────────────────

import { useState, useMemo, useRef } from "react";
import { useCategories } from "@/hooks/usePOSData";
import { useProducts } from "@/hooks/usePOSData";
import { usePOSMode } from "@/context/POSModeContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { writeProductOnline } from "@/services/firestore/products";

import { Product, Category, InsertProduct } from "@/types/schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Edit, Trash2, Package } from "lucide-react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function Products() {
  const {
    data: products,
    setData: setProducts,
    isLoading,
  } = useProducts();

  const { data: categories } = useCategories();
  const { toast } = useToast();
  const mode = usePOSMode();
  const { user } = useFirebaseAuth();

  const productsRef = useRef(products);
  productsRef.current = products;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<InsertProduct>({
    name: "",
    price: 0,
    categoryId: "",
  });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const visibleProducts = useMemo(
    () => products.filter((p) => !p.isDeleted),
    [products]
  );

  const visibleCategories = useMemo(
    () => categories.filter((c) => !c.isDeleted),
    [categories]
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: 0,
      categoryId: visibleCategories[0]?.id || "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const now = Date.now();
    const deletedProduct: Product = {
      ...product,
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    };

    const updated = productsRef.current.map((p) =>
      p.id === product.id ? deletedProduct : p
    );

    await setProducts(updated);

    if (mode === "online" && user) {
      try {
        await writeProductOnline(user.uid, deletedProduct);
      } catch (e) {
        console.error("Product delete sync failed", e);
      }
    }

    toast({
      title: "Product deleted",
      description: "Product has been removed safely",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please fill all fields correctly",
      });
      return;
    }

    setIsDialogOpen(false);
    setEditingProduct(null);

    try {
      const now = Date.now();

      if (editingProduct) {
        const updatedProduct: Product = {
          ...editingProduct,
          ...formData,
          updatedAt: now,
        };

        const updated = productsRef.current.map((p) =>
          p.id === editingProduct.id ? updatedProduct : p
        );

        await setProducts(updated);

        if (mode === "online" && user) {
          try {
            await writeProductOnline(user.uid, updatedProduct);
          } catch (e) {
            console.error("Product update sync failed", e);
          }
        }

        toast({
          title: "Product updated",
          description: `${formData.name} updated`,
        });
      } else {
        const newProduct: Product = {
          id: nanoid(),
          ...formData,
          addCount: 0,
          updatedAt: now,
          isDeleted: false,
        };

        const updated = [...productsRef.current, newProduct];

        await setProducts(updated);

        if (mode === "online" && user) {
          try {
            await writeProductOnline(user.uid, newProduct);
          } catch (e) {
            console.error("Product add sync failed", e);
          }
        }

        toast({
          title: "Product added",
          description: `${formData.name} added`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Something went wrong",
      });
    }

    setFormData({ name: "", price: 0, categoryId: "" });
  };

  const getCategoryName = (id: string) =>
    categories.find((c: Category) => c.id === id)?.name || "Unknown";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            if (visibleCategories.length === 0) {
              toast({ variant: "destructive", title: "No category found", description: "Please add a category before adding products" });
              return;
            }
            handleAdd();
          }}
        >
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </Button>
      </div>

      {visibleProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Add a product to start billing</p>
          <Button onClick={() => { if (visibleCategories.length === 0) { toast({ variant: "destructive", title: "No category found", description: "Please add a category first" }); return; } handleAdd(); }}>
            <Plus className="h-5 w-5 mr-2" /> Add Product
          </Button>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">Category</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">Price</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="px-2 sm:px-4 py-3">
                    <div className="font-medium break-words leading-snug">{product.name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{getCategoryName(product.categoryId)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{getCategoryName(product.categoryId)}</td>
                  <td className="px-2 sm:px-4 py-3 text-right font-semibold whitespace-nowrap">₹{product.price.toFixed(2)}</td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteProduct(product)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Product name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{visibleCategories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
            <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingProduct ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteProduct}
        title="Delete Product"
        description="Is product ko delete karne ke baad billing me use nahi hoga."
        onCancel={() => setDeleteProduct(null)}
        onConfirm={() => {
          const p = deleteProduct;
          setDeleteProduct(null);
          if (!p) return;
          const now = Date.now();
          const deletedProduct: Product = { ...p, isDeleted: true, deletedAt: now, updatedAt: now };
          const updated = productsRef.current.map((x) => x.id === p.id ? deletedProduct : x);
          (async () => {
            await setProducts(updated);
            if (mode === "online" && user) { try { await writeProductOnline(user.uid, deletedProduct); } catch (e) { console.error("Product delete sync failed", e); } }
            toast({ title: "Product deleted", description: "Product removed safely" });
          })();
        }}
      />
    </div>
  );
}