import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useEncryptedStorage';
import { Product, Category, InsertProduct } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const { data: products, setData: setProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<InsertProduct>({
    name: '',
    price: 0,
    categoryId: '',
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: 0, categoryId: categories[0]?.id || '' });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const updated = products.filter((p: Product) => p.id !== id);
    await setProducts(updated);
    toast({
      title: 'Product deleted',
      description: 'The product has been removed',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid input',
        description: 'Please fill all fields correctly',
      });
      return;
    }

    if (editingProduct) {
      const updated = products.map((p: Product) =>
        p.id === editingProduct.id
          ? { ...p, ...formData }
          : p
      );
      await setProducts(updated);
      toast({
        title: 'Product updated',
        description: `${formData.name} has been updated`,
      });
    } else {
      const newProduct: Product = {
        id: nanoid(),
        ...formData,
        addCount: 0,
      };
      await setProducts([...products, newProduct]);
      toast({
        title: 'Product added',
        description: `${formData.name} has been added`,
      });
    }

    setIsDialogOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c: Category) => c.id === categoryId)?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={handleAdd} data-testid="button-add-product">
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first product
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-5 w-5 mr-2" />
              Add Product
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
                  <th className="text-left px-4 py-3 text-sm font-semibold">Category</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Price</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="border-b hover-elevate"
                    data-testid={`product-row-${product.id}`}
                  >
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          data-testid={`button-delete-${product.id}`}
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
        <DialogContent data-testid="dialog-product-form">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Product Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="h-12"
                data-testid="input-product-name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="h-12" data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-12"
                data-testid="input-product-price"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" data-testid="button-save-product">
                {editingProduct ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
