import { useEffect, useRef } from 'react';

interface UsePrintOnceOptions {
  isReady: boolean;
  onAfterPrint?: () => void;
}

export function usePrintOnce({ isReady, onAfterPrint }: UsePrintOnceOptions) {
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (isReady && !hasPrinted.current) {
      hasPrinted.current = true;
      
      // Set up afterprint listener if callback provided
      if (onAfterPrint) {
        const handleAfterPrint = () => {
          onAfterPrint();
          window.removeEventListener('afterprint', handleAfterPrint);
        };
        window.addEventListener('afterprint', handleAfterPrint);
      }

      // Trigger print dialog
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [isReady, onAfterPrint]);
}
