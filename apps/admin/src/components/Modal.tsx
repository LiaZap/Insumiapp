import { type ReactNode, useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Drawer — painel lateral (right-side sheet)                         */
/* ------------------------------------------------------------------ */

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, subtitle, children, width = 'md:w-[440px]' }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={`fixed right-0 top-0 z-50 h-full w-full ${width} overflow-y-auto bg-white shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200`}
          aria-describedby={undefined}
        >
          {(title || subtitle) ? (
            <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
              <div>
                {title ? (
                  <Dialog.Title className="text-lg font-bold text-brand-700">
                    {title}
                  </Dialog.Title>
                ) : null}
                {subtitle ? (
                  <Dialog.Description className="mt-0.5 text-sm text-ink-500">
                    {subtitle}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-surface-base hover:text-ink-700"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
          ) : (
            <Dialog.Title className="sr-only">Painel</Dialog.Title>
          )}
          <div className="px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal — diálogo centrado                                           */
/* ------------------------------------------------------------------ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, description, children, maxWidth = 'max-w-md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-full ${maxWidth} mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`}
          aria-describedby={description ? 'modal-desc' : undefined}
        >
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-lg font-bold text-brand-700">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-surface-base hover:text-ink-700"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description id="modal-desc" className="mt-1 text-sm text-ink-500">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  ConfirmDialog — diálogo de confirmação com variante perigosa       */
/* ------------------------------------------------------------------ */

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Quando fornecido, o usuário deve digitar este texto para habilitar o botão */
  confirmText?: string;
  variant?: 'default' | 'danger';
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmText,
  variant = 'default',
  isPending = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const canConfirm = confirmText ? typed === confirmText : true;

  const dangerClass = 'bg-danger text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed';
  const defaultClass = 'bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby="confirm-desc"
        >
          <Dialog.Title className="text-base font-bold text-ink-900">{title}</Dialog.Title>
          <Dialog.Description id="confirm-desc" className="mt-2 text-sm text-ink-500 leading-relaxed">
            {description}
          </Dialog.Description>

          {confirmText ? (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-ink-700">
                Digite{' '}
                <span className="font-bold text-ink-900">"{confirmText}"</span>{' '}
                para confirmar
              </label>
              <input
                type="text"
                autoComplete="off"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
          ) : null}

          <div className="mt-5 flex gap-2">
            <Dialog.Close asChild>
              <button className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-surface-base">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={isPending || !canConfirm}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                variant === 'danger' ? dangerClass : defaultClass
              }`}
            >
              {isPending ? 'Aguarde...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
