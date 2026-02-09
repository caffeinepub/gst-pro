import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Share, Plus, Home } from 'lucide-react';

interface IosInstallHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IosInstallHelpDialog({ open, onOpenChange }: IosInstallHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install GST Pro on iOS</DialogTitle>
          <DialogDescription>
            Follow these steps to add GST Pro to your home screen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">1</span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Open the Share menu</p>
              <p className="text-sm text-muted-foreground">
                Tap the <Share className="inline h-4 w-4" /> Share button in Safari's toolbar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">2</span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Select "Add to Home Screen"</p>
              <p className="text-sm text-muted-foreground">
                Look for the <Plus className="inline h-4 w-4" /> icon with "Add to Home Screen" text
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">3</span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Confirm installation</p>
              <p className="text-sm text-muted-foreground">
                Tap "Add" to install GST Pro on your <Home className="inline h-4 w-4" /> home screen
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
