import { useState, useEffect } from "react";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import BaseModal from "../../components/BaseModal/BaseModal";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  mode?: "add" | "edit" | "delete";
}

export default function ClientModal({
  isOpen,
  onClose,
  client,
  mode = "add",
}: ClientModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (client && mode !== "add") {
      setName(client.name);
      setPhone(client.phone || "");
      setEmail(client.email || "");
      setNotes(client.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    }
  }, [client, mode, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    if (client) {
      clientsStore.updateClient(client.id, { name, phone, email, notes });
    } else {
      clientsStore.addClient({ name, phone, email, notes });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!client) return;
    clientsStore.deleteClient(client.id);
    onClose();
  };

  const title =
    mode === "add"
      ? "Dodaj klienta"
      : mode === "edit"
      ? "Edytuj klienta"
      : "Usuń klienta";

  const renderBody = () =>
    mode === "delete" ? (
      <p className="dark:text-gray-100">
        Czy na pewno chcesz usunąć klienta{" "}
        <span className="font-semibold">{client?.name}</span>?
      </p>
    ) : (
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
        <textarea
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
          placeholder="Notatki"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
