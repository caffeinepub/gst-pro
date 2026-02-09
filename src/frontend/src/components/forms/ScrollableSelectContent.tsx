import * as React from 'react';
import { SelectContent } from '@/components/ui/select';

interface ScrollableSelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectContent> {
  children: React.ReactNode;
}

/**
 * A wrapper around SelectContent that ensures reliable scrolling on iOS and all platforms.
 * Applies max-height, overflow-y auto, iOS momentum scrolling, and overscroll containment.
 */
export function ScrollableSelectContent({ children, className, ...props }: ScrollableSelectContentProps) {
  return (
    <SelectContent
      className={className}
      {...props}
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        ...props.style,
      }}
    >
      {children}
    </SelectContent>
  );
}
