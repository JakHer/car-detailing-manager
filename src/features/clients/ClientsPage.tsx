import { observer } from "mobx-react-lite";
import { useState } from "react";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import { ordersStore } from "../../stores/OrdersStore";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import { motion, AnimatePresence } from "framer-motion";
import PageSection from "../../layouts/PageSection/PageSection";
import ClientModal from "./ClientModal";
import { FiEdit, FiEye, FiEyeOff, FiTrash2, FiUserPlus } from "react-icons/fi";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";

const ClientsPage = observer(() => {
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "">(
    ""
  );
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

  const toggleExpand = (id: number) =>
    setExpandedClientId(expandedClientId === id ? null : id);

  const openModal = (
    client: Client | null,
    mode: "add" | "edit" | "delete"
  ) => {
    setModalClient(client);
    setModalMode(mode);
  };

  return (
    <PageSection
      title="Klienci"
      action={
        <Button
          onClick={() => openModal(null, "add")}
          variant="primary"
          className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <FiUserPlus className="w-4 h-4" />
        </Button>
      }
    >
      {clientsStore.clients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-gray-500 dark:text-gray-400"
        >
          Brak klientów — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </motion.div>
      )}

      <AnimatePresence>
        {clientsStore.clients.map((client, index) => {
          const clientOrders = ordersStore.orders.filter(
            (o) => o.client.id === client.id
          );

          const lastOrderDate = clientOrders.length
            ? new Date(
                clientOrders[clientOrders.length - 1].createdAt
              ).toLocaleDateString()
            : "Brak zamówień";

          const totalRevenue = clientOrders.reduce(
            (sum, o) => sum + o.services.reduce((sSum, s) => sSum + s.price, 0),
            0
          );

          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                title={client.name}
                className="hover:shadow-lg transition-transform duration-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                  <span className="font-bold">Telefon:</span>
                  <span className="truncate">{client.phone}</span>

                  <span className="font-bold">Email:</span>
                  <span className="truncate">{client.email}</span>

                  <span className="font-bold">Ostatnie zamówienie:</span>
                  <span className="truncate">{lastOrderDate}</span>

                  <span className="font-bold">Suma przychodów:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    {totalRevenue} zł
                  </span>
                </div>
                {client.notes && (
                  <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400 break-words">
                    „{client.notes}”
                  </p>
                )}

                <ButtonGroup align="right">
                  <Button
                    size="icon"
                    variant="secondary"
                    title="Edytuj klienta"
                    onClick={() => openModal(client, "edit")}
                  >
                    <FiEdit className="w-4 h-4" />
                  </Button>

                  {clientOrders.length > 0 && (
                    <Button
                      size="icon"
                      variant="outline"
                      title={
                        expandedClientId === client.id
                          ? "Ukryj zamówienia"
                          : "Pokaż zamówienia"
                      }
                      onClick={() => toggleExpand(client.id)}
                    >
                      {expandedClientId === client.id ? (
                        <FiEyeOff className="w-4 h-4" />
                      ) : (
                        <FiEye className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="destructive"
                    title="Usuń klienta"
                    onClick={() => openModal(client, "delete")}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </ButtonGroup>

                <AnimatePresence>
                  {expandedClientId === client.id && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ originY: 0 }}
                      className="mt-2 border-t pt-3 text-sm text-gray-700 dark:text-gray-300 overflow-hidden"
                    >
                      {clientOrders.map((o) => (
                        <div
                          key={o.id}
                          className="mb-2 bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg"
                        >
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            {o.services
                              .map((s) => `${s.name} (${s.price} zł)`)
                              .join(", ")}
                          </p>
                          {o.notes && (
                            <p className="italic text-gray-500 dark:text-gray-400 mt-1">
                              „{o.notes}”
                            </p>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {modalMode && (
        <ClientModal
          isOpen={!!modalMode}
          mode={modalMode}
          client={modalClient}
          onClose={() => setModalMode("")}
        />
      )}
    </PageSection>
  );
});

export default ClientsPage;
