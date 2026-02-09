import { useState } from 'react';
import { useGetCustomers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import CustomersTable from '../components/customers/CustomersTable';
import CustomerFormDialog from '../components/customers/CustomerFormDialog';
import type { Customer } from '../backend';

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useGetCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <CustomersTable
        customers={filteredCustomers}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <CustomerFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        customer={editingCustomer}
      />
    </div>
  );
}
