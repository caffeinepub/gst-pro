import { useState } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Smartphone } from 'lucide-react';
import IosInstallHelpDialog from './IosInstallHelpDialog';
import { toast } from 'sonner';

export default function PwaInstallFooterSection() {
  const { installState, isIos, canPromptInstall, promptInstall } = usePwaInstall();
  const [showIosDialog, setShowIosDialog] = useState(false);

  // Don't show anything if already installed
  if (installState === 'installed') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleAndroidInstall = async () => {
    if (canPromptInstall) {
      const success = await promptInstall();
      if (success) {
        toast.success('App installed successfully!');
      }
    } else {
      toast.info('Installation is not available in this browser. Try Chrome or Edge.');
    }
  };

  const handleIosInstall = () => {
    setShowIosDialog(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium">Install App:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAndroidInstall}
            className="h-auto p-0 hover:bg-transparent"
            title="Install on Android"
          >
            <img
              src="/assets/generated/gst-pro-install-android-badge.dim_512x160.png"
              alt="Install on Android"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-sm">Install on Android</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleIosInstall}
            className="h-auto p-0 hover:bg-transparent"
            title="Install on iOS"
          >
            <img
              src="/assets/generated/gst-pro-install-ios-badge.dim_512x160.png"
              alt="Install on iOS"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-sm">Install on iOS</span>
          </Button>
        </div>
      </div>
      <IosInstallHelpDialog open={showIosDialog} onOpenChange={setShowIosDialog} />
    </>
  );
}
