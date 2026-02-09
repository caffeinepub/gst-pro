import { useState } from 'react';
import { useGetItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import ItemsTable from '../components/items/ItemsTable';
import ItemFormDialog from '../components/items/ItemFormDialog';
import type { Item } from '../backend';

export default function ItemsPage() {
  const { data: items = [], isLoading } = useGetItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items & Services</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ItemsTable items={filteredItems} isLoading={isLoading} onEdit={handleEdit} />

      <ItemFormDialog open={isDialogOpen} onClose={handleCloseDialog} item={editingItem} />
    </div>
  );
}
