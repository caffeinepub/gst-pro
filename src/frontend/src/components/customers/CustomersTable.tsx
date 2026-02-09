import { useState } from 'react';
import { useDeleteCustomer } from '../../hooks/useQueries';
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
import { Edit, Trash2, Users } from 'lucide-react';
import type { Customer } from '../../backend';
import { toast } from 'sonner';
import { getUserFacingError } from '../../utils/userFacingError';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
}

export default function CustomersTable({ customers, isLoading, onEdit }: CustomersTableProps) {
  const deleteCustomer = useDeleteCustomer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer.mutateAsync(customerToDelete.id);
        toast.success('Customer deleted successfully');
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } catch (error: any) {
        const errorMessage = getUserFacingError(error);
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading customers...</div>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-sm text-muted-foreground">
            {customers.length === 0 ? 'Add your first customer to get started' : 'Try a different search'}
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
              <TableHead>State</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id.toString()}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.state}</TableCell>
                <TableCell>{customer.gstin || '-'}</TableCell>
                <TableCell>{customer.contactInfo || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(customer)} className="touch-target">
                      <Edit className="h-4 w-4" />
                      <span className="ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(customer)}
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
        {customers.map((customer) => (
          <Card key={customer.id.toString()} className="p-4">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-lg">{customer.name}</div>
                <div className="text-sm text-muted-foreground">{customer.state}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">GSTIN</div>
                  <div className="font-medium">{customer.gstin || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Contact</div>
                  <div className="font-medium">{customer.contactInfo || '-'}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(customer)} 
                  className="flex-1 touch-target"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(customer)}
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
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
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
