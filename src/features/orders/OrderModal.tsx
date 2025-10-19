import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { clientsStore } from "../../stores/ClientsStore";
import { servicesStore } from "../../stores/ServicesStore";
import {
  ordersStore,
  type Order,
  type OrderStatus,
} from "../../stores/OrdersStore";
import Button from "../../components/Button/Button";
import Title from "../../components/Title/Title";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  mode: "add" | "edit" | "delete";
}

const STATUS_OPTIONS: OrderStatus[] = [
  "Nowe",
  "Przyjęte",
  "W toku",
  "Czeka na odbiór",
  "Zakończone",
  "Anulowane",
];

export default function OrderModal({
  isOpen,
  onClose,
  order,
  mode,
}: OrderModalProps) {
  const [clientId, setClientId] = useState<number | "">("");
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [status, setStatus] = useState<OrderStatus>("Przyjęte");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (order && mode !== "add") {
      setClientId(order.client.id);
      setServiceIds(order.services.map((s) => s.id));
      setStatus(order.status);
      setNotes(order.notes || "");
    } else {
      setClientId("");
      setServiceIds([]);
      setStatus("Przyjęte");
      setNotes("");
    }
  }, [order, mode, isOpen]);

  const toggleService = (id: number) => {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!clientId || serviceIds.length === 0) return;

    const client = clientsStore.clients.find((c) => c.id === clientId)!;
    const services = servicesStore.services.filter((s) =>
      serviceIds.includes(s.id)
    );

    if (order && mode === "edit") {
      ordersStore.updateOrder(order.id, { client, services, status, notes });
    } else if (mode === "add") {
      ordersStore.addOrder({ client, services, status, notes });
    }

    onClose();
  };

  const handleDelete = () => {
    if (order) {
      ordersStore.deleteOrder(order.id);
      onClose();
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
          <Title className="text-xl font-bold mb-4">
            {mode === "add"
              ? "Dodaj zlecenie"
              : mode === "edit"
              ? "Edytuj zlecenie"
              : "Usuń zlecenie"}
          </Title>

          {mode === "delete" ? (
            <>
              <p className="dark:text-gray-100">
                Czy na pewno chcesz usunąć zlecenie{" "}
                <span className="font-semibold">{order?.client.name}</span>?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={onClose}>
                  Anuluj
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Usuń
                </Button>
              </div>
            </>
          ) : (
            <>
              <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full"
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

              <div className="flex flex-col max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 px-3 py-2 rounded space-y-1 mt-3">
                {servicesStore.services.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer dark:text-gray-100 text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={serviceIds.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="form-checkbox accent-cyan-500"
                    />
                    {s.name} ({s.price} zł)
                  </label>
                ))}
              </div>

              <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full mt-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <textarea
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full mt-3"
                placeholder="Notatki"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={onClose}>
                  Anuluj
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  {mode === "edit" ? "Zapisz" : "Dodaj"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </Transition>
  );
}
