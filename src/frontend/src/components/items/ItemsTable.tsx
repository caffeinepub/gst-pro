import { useState } from 'react';
import { useDeleteItem } from '../../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Package } from 'lucide-react';
import type { Item } from '../../backend';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import { getUserFacingError } from '../../utils/userFacingError';

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
  onEdit: (item: Item) => void;
}

export default function ItemsTable({ items, isLoading, onEdit }: ItemsTableProps) {
  const deleteItem = useDeleteItem();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteItem.mutateAsync(itemToDelete.id);
        toast.success('Item deleted successfully');
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error: any) {
        const errorMessage = getUserFacingError(error);
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading items...</div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-sm text-muted-foreground">
            {items.length === 0 ? 'Add your first item to get started' : 'Try a different search'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>HSN/SAC</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">GST Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id.toString()}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.hsnSac || '-'}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">{item.defaultGstRate}%</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="touch-target">
                      <Edit className="h-4 w-4" />
                      <span className="ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(item)}
                      className="text-destructive hover:text-destructive touch-target"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <Card key={item.id.toString()} className="p-4">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-lg">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">HSN/SAC</div>
                  <div className="font-medium">{item.hsnSac || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">GST Rate</div>
                  <div className="font-medium">{item.defaultGstRate}%</div>
                </div>
              </div>

              <div className="text-lg font-semibold">{formatCurrency(item.unitPrice)}</div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(item)} 
                  className="flex-1 touch-target"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(item)}
                  className="flex-1 text-destructive hover:text-destructive touch-target"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
