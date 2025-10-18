import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { clientsStore } from "../../stores/ClientsStore";
import { servicesStore } from "../../stores/ServicesStore";
import { ordersStore } from "../../stores/OrdersStore";
import Button from "../../components/Button/Button"; // <- import naszego Button
import Title from "../../components/Title/Title";

export default function AddOrderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [clientId, setClientId] = useState<number | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");

  const handleAdd = () => {
    if (clientId && serviceId) {
      const client = clientsStore.clients.find((c) => c.id === clientId)!;
      const service = servicesStore.services.find((s) => s.id === serviceId)!;

      ordersStore.addOrder({ client, service, status: "W toku" });
      onClose();
      setClientId("");
      setServiceId("");
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 z-50 overflow-y-auto relative">
          <Title className="text-xl font-bold mb-4">Dodaj nowe zlecenie</Title>

          <div className="flex flex-col space-y-4">
            <select
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
            >
              <option value="">Wybierz klienta</option>
              {clientsStore.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
            >
              <option value="">Wybierz usługę</option>
              {servicesStore.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.price} zł)
                </option>
              ))}
            </select>

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
