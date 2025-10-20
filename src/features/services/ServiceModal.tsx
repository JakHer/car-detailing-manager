import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { servicesStore, type Service } from "../../stores/ServicesStore";
import Button from "../../components/Button/Button";
import Title from "../../components/Title/Title";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  mode: "add" | "edit" | "delete";
}

export default function ServiceModal({
  isOpen,
  onClose,
  service,
  mode,
}: ServiceModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");

  useEffect(() => {
    if (service && mode !== "add") {
      setName(service.name);
      setPrice(service.price);
    } else {
      setName("");
      setPrice("");
    }
  }, [service, mode, isOpen]);

  const handleSave = () => {
    if (!name || price === "") return;

    if (service) {
      servicesStore.updateService(service.id, { name, price: Number(price) });
    } else {
      servicesStore.addService({ name, price: Number(price) });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!service) return;
    servicesStore.deleteService(service.id);
    onClose();
  };

  const renderForm = () => (
    <div className="flex flex-col space-y-4 overflow-visible">
      <input
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
        placeholder="Nazwa usługi"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
        type="number"
        placeholder="Cena"
        value={price}
        onChange={(e) =>
          setPrice(e.target.value === "" ? "" : Number(e.target.value))
        }
      />

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>
          Anuluj
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {service ? "Zapisz" : "Dodaj"}
        </Button>
      </div>
    </div>
  );

  const renderDelete = () => (
    <>
      <p className="dark:text-gray-100">
        Czy na pewno chcesz usunąć usługę{" "}
        <span className="font-semibold" title={service?.name}>
          {service?.name}
        </span>
        ?
      </p>
      <ButtonGroup align="right">
        <Button variant="secondary" onClick={onClose}>
          Anuluj
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Usuń
        </Button>
      </ButtonGroup>
    </>
  );

  const title =
    mode === "add"
      ? "Dodaj usługę"
      : mode === "edit"
      ? "Edytuj usługę"
      : "Usuń usługę";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-2 sm:px-0"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 z-50 overflow-visible relative">
          <Title className="text-xl font-bold mb-4">{title}</Title>
          <div className="overflow-visible max-h-[70vh]">
            {mode === "delete" ? renderDelete() : renderForm()}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
