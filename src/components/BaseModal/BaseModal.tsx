import { Dialog, Transition } from "@headlessui/react";
import Button from "../../components/Button/Button";
import { Fragment, type JSX } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  renderBody: () => JSX.Element;
  onSave?: () => void;
  onDelete?: () => void;
  mode?: "add" | "edit" | "delete";
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  renderBody,
  onSave,
  onDelete,
  mode = "add",
}: BaseModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-2 sm:px-0"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 z-50 overflow-visible relative">
          <h2 className="text-xl font-bold mb-4 dark:text-gray-100">{title}</h2>

          <div className="overflow-visible max-h-[70vh]">{renderBody()}</div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>
              Anuluj
            </Button>

            {mode === "delete" && onDelete ? (
              <Button variant="destructive" onClick={onDelete}>
                Usuń
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onSave}
                disabled={!onSave}
                className={`${
                  !onSave
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : ""
                }`}
              >
                {mode === "edit" ? "Zapisz" : "Dodaj"}
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
