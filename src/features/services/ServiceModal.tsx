import { useState, useEffect } from "react";
import { servicesStore, type Service } from "../../stores/ServicesStore";
import BaseModal from "../../components/BaseModal/BaseModal";

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

  const title =
    mode === "add"
      ? "Dodaj usługę"
      : mode === "edit"
      ? "Edytuj usługę"
      : "Usuń usługę";

  const renderBody = () =>
    mode === "delete" ? (
      <p className="dark:text-gray-100">
        Czy na pewno chcesz usunąć usługę{" "}
        <span className="font-semibold">{service?.name}</span>?
      </p>
    ) : (
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
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>
    );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      mode={mode}
      renderBody={renderBody}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
