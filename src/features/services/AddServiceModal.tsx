import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { servicesStore } from "../../stores/ServicesStore";
import Button from "../../components/Button/Button"; // <- nasz Button
import Title from "../../components/Title/Title";

export default function AddServiceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const handleAdd = () => {
    if (name && price !== "") {
      servicesStore.addService({ name, price: Number(price) });
      onClose();
      setName("");
      setPrice("");
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 z-50 overflow-y-auto relative">
          <Title className="text-xl font-bold mb-4">Dodaj usługę</Title>

          <div className="flex flex-col space-y-4">
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              placeholder="Nazwa usługi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              type="number"
              placeholder="Cena"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={onClose}>
                Anuluj
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                Dodaj
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
