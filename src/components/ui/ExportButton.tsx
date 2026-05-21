import { ArrowDownTrayIcon, DocumentArrowDownIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { Dropdown } from './Dropdown';
import { Button } from './Button';

export function ExportButton({
  onCsv,
  onExcel,
  onPdf,
}: {
  onCsv: () => void;
  onExcel: () => void;
  onPdf: () => void;
}) {
  const itemClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900';
  return (
    <Dropdown trigger={<Button variant="secondary" icon={<ArrowDownTrayIcon />}>Export</Button>}>
      <button type="button" onClick={onCsv} className={itemClass}>
        <DocumentArrowDownIcon className="size-4" /> CSV
      </button>
      <button type="button" onClick={onExcel} className={itemClass}>
        <TableCellsIcon className="size-4" /> Excel
      </button>
      <button type="button" onClick={onPdf} className={itemClass}>
        <DocumentArrowDownIcon className="size-4" /> PDF
      </button>
    </Dropdown>
  );
}
