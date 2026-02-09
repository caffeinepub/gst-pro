import { useEffect, useRef } from 'react';

interface UsePrintOnceOptions {
  /**
   * Whether the print view is ready (all required data is loaded and rendered)
   */
  isReady: boolean;
  /**
   * Optional callback to run after printing (e.g., navigation)
   */
  onAfterPrint?: () => void;
}

/**
 * Hook to trigger window.print() exactly once per page load when ready.
 * Prevents repeated print dialogs and ensures data is loaded before printing.
 */
export function usePrintOnce({ isReady, onAfterPrint }: UsePrintOnceOptions) {
  const hasPrintedRef = useRef(false);
  const afterPrintHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isReady || hasPrintedRef.current) {
      return;
    }

    // Set up afterprint handler if provided
    if (onAfterPrint) {
      afterPrintHandlerRef.current = onAfterPrint;
      const handleAfterPrint = () => {
        if (afterPrintHandlerRef.current) {
          afterPrintHandlerRef.current();
          afterPrintHandlerRef.current = null;
        }
      };
      window.addEventListener('afterprint', handleAfterPrint);
    }

    // Mark as printed before triggering to prevent race conditions
    hasPrintedRef.current = true;

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (onAfterPrint) {
        window.removeEventListener('afterprint', afterPrintHandlerRef.current!);
      }
    };
  }, [isReady, onAfterPrint]);
}
