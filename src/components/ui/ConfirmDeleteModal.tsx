import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDeleteModal({
  open,
  title = 'Delete record',
  description,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  title?: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            Delete
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
    </Modal>
  );
}
