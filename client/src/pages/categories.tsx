import { useState } from 'react';
import { useCategories, useProducts } from '@/hooks/useEncryptedStorage';
import { Category, Product, InsertCategory } from '@shared/schema';
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
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

export default function Categories() {
  const { data: categories, setData: setCategories, isLoading } = useCategories();
  const { data: products, setData: setProducts } = useProducts();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<InsertCategory>({ name: '' });

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const productsInCategory = products.filter((p: Product) => p.categoryId === id);
    
    if (productsInCategory.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete',
        description: `This category has ${productsInCategory.length} product(s). Remove them first.`,
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    const updated = categories.filter((c: Category) => c.id !== id);
    await setCategories(updated);
    toast({
      title: 'Category deleted',
      description: 'The category has been removed',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid input',
        description: 'Please enter a category name',
      });
      return;
    }

    if (editingCategory) {
      const updated = categories.map((c: Category) =>
        c.id === editingCategory.id
          ? { ...c, name: formData.name }
          : c
      );
      await setCategories(updated);
      toast({
        title: 'Category updated',
        description: `${formData.name} has been updated`,
      });
    } else {
      const newCategory: Category = {
        id: nanoid(),
        name: formData.name,
      };
      await setCategories([...categories, newCategory]);
      toast({
        title: 'Category added',
        description: `${formData.name} has been added`,
      });
    }

    setIsDialogOpen(false);
  };

  const getProductCount = (categoryId: string) => {
    return products.filter((p: Product) => p.categoryId === categoryId).length;
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

      {categories.length === 0 ? (
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
                {categories.map((category: Category) => (
                  <tr
                    key={category.id}
                    className="border-b hover-elevate"
                    data-testid={`category-row-${category.id}`}
                  >
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {getProductCount(category.id)} item{getProductCount(category.id) !== 1 ? 's' : ''}
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
                          onClick={() => handleDelete(category.id)}
                          data-testid={`button-delete-${category.id}`}
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
        <DialogContent data-testid="dialog-category-form">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
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
                data-testid="input-category-name"
                autoFocus
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
              <Button type="submit" data-testid="button-save-category">
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
