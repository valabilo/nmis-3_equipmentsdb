import { PrinterIcon } from '@heroicons/react/24/outline';
import { useReactToPrint } from 'react-to-print';
import type { RefObject } from 'react';
import { Button } from './Button';

export function PrintButton({ contentRef, label = 'Print' }: { contentRef: RefObject<HTMLElement | null>; label?: string }) {
  const print = useReactToPrint({ contentRef });
  return (
    <Button variant="secondary" onClick={() => print()} icon={<PrinterIcon />}>
      {label}
    </Button>
  );
}
