import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { clientsStore } from "../../stores/ClientsStore";
import Button from "../../components/Button/Button";
import Title from "../../components/Title/Title";

export default function AddClientModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (name) {
      clientsStore.addClient({ name, phone, email });
      onClose();
      setName("");
      setPhone("");
      setEmail("");
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
          <Title className="text-xl font-bold mb-4">Dodaj klienta</Title>

          <div className="flex flex-col space-y-4">
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              placeholder="Imię i nazwisko"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
