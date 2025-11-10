import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import Button from "../../components/Button/Button";
import { Fragment, type JSX } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  renderBody: () => JSX.Element;
  onSave?: () => void;
  onDelete?: () => void;
  mode?: "add" | "edit" | "delete" | "addCar" | "editCar" | "deleteCar";
}

const BaseModal = ({
  isOpen,
  onClose,
  title,
  renderBody,
  onSave,
  onDelete,
  mode = "add",
}: BaseModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h2"
                  className="text-xl font-bold mb-4 dark:text-gray-100"
                >
                  {title}
                </Dialog.Title>

                <div className="overflow-y-auto max-h-[70vh]">
                  {renderBody()}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="secondary" onClick={onClose}>
                    Anuluj
                  </Button>

                  {["delete", "deleteCar"].includes(mode) && onDelete ? (
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
                      {["edit", "editCar"].includes(mode) ? "Zapisz" : "Dodaj"}
                    </Button>
                  )}
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BaseModal;
