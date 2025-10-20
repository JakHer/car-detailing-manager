import { observer } from "mobx-react-lite";
import { useState } from "react";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import { ordersStore, type OrderStatus } from "../../stores/OrdersStore";
import ClientModal from "./ClientModal";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import { FiEdit, FiEye, FiEyeOff, FiTrash2, FiUserPlus } from "react-icons/fi";
import ExpandableTable from "../../components/ExpandableTable/ExpandableTable";
import { motion } from "framer-motion";
import { STATUS_COLORS } from "../../components/Card/Card";

const ClientsPage = observer(() => {
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "">(
    ""
  );
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

  const openModal = (
    client: Client | null,
    mode: "add" | "edit" | "delete"
  ) => {
    setModalClient(client);
    setModalMode(mode);
  };

  const columns = [
    { header: "Imię", render: (c: Client) => c.name },
    { header: "Telefon", render: (c: Client) => c.phone || "-" },
    { header: "Email", render: (c: Client) => c.email || "-" },
    {
      header: "Ostatnie zamówienie",
      render: (c: Client) => {
        const orders = ordersStore.orders.filter((o) => o.client.id === c.id);
        return orders.length
          ? new Date(orders[orders.length - 1].createdAt).toLocaleDateString()
          : "-";
      },
    },
    {
      header: "Przychód",
      render: (c: Client) => {
        const orders = ordersStore.orders.filter(
          (o) => o.client.id === c.id && o.status === "Zakończone"
        );
        const total = orders.reduce(
          (sum, o) => sum + o.services.reduce((s, srv) => s + srv.price, 0),
          0
        );
        return (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {total > 0 ? `${total} zł` : "-"}
          </span>
        );
      },
    },
    {
      header: "Notatki",
      render: (client: Client) => (
        <span
          className="italic text-gray-500 dark:text-gray-400 max-w-[150px] truncate block"
          title={client.notes || "-"}
        >
          {client.notes || "-"}
        </span>
      ),
    },
  ];

  const renderExpanded = (client: Client) => {
    const clientOrders = ordersStore.orders.filter(
      (o) => o.client.id === client.id
    );

    const totalRevenue = clientOrders.reduce(
      (sum, order) =>
        sum + order.services.reduce((sSum, s) => sSum + s.price, 0),
      0
    );

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded mt-2"
      >
        <div className="grid grid-cols-5 gap-4 p-2 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200">
          <span>Data</span>
          <span>Usługi</span>
          <span>Suma</span>
          <span>Status</span>
          <span>Notatki</span>
        </div>

        <div className="space-y-1">
          {clientOrders.map((order, idx) => (
            <div
              key={order.id}
              className={`grid grid-cols-5 gap-4 p-2 ${
                idx % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-700"
                  : "bg-gray-100 dark:bg-gray-600"
              } text-gray-700 dark:text-gray-200 overflow-x-auto whitespace-nowrap block`}
            >
              <span className="truncate whitespace-nowrap text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>

              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto min-h-0">
                {order.services.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex justify-between text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap overflow-hidden truncate"
                  >
                    <span className="whitespace-nowrap overflow-hidden truncate">
                      {s.name}
                    </span>
                    <span>{s.price} zł</span>
                  </div>
                ))}
              </div>

              <span className="font-medium whitespace-nowrap truncate">
                {order.services.reduce((sSum, s) => sSum + s.price, 0)} zł
              </span>

              <div className="flex items-start max-w-[150px]">
                <span
                  className={`inline-block px-2 py-0.5 text-sm font-semibold rounded whitespace-nowrap overflow-hidden truncate max-w-[150px] ${
                    STATUS_COLORS[order.status as OrderStatus]?.bg
                  } ${STATUS_COLORS[order.status as OrderStatus]?.text}`}
                  title={order.status}
                >
                  {order.status}
                </span>
              </div>

              <span
                className="italic text-gray-500 dark:text-gray-400 max-w-[150px] truncate block"
                title={order.notes || "-"}
              >
                {order.notes || "-"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4 p-2 bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-400 dark:border-gray-600">
          <span>Razem:</span>
          <span></span>
          <span>{totalRevenue} zł</span>
          <span></span>
          <span></span>
        </div>
      </motion.div>
    );
  };

  const renderActions = (client: Client) => {
    const clientOrders = ordersStore.orders.filter(
      (o) => o.client.id === client.id
    );
    return (
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
            onClick={() =>
              setExpandedClientId(
                expandedClientId === client.id ? null : client.id
              )
            }
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
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Klienci</h1>
        <Button
          onClick={() => openModal(null, "add")}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiUserPlus />
        </Button>
      </div>

      {clientsStore.clients.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          Brak klientów — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </p>
      ) : (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded mt-2"
        >
          <ExpandableTable
            data={clientsStore.clients}
            columns={columns}
            keyField="id"
            renderExpanded={renderExpanded}
            renderActions={renderActions}
            expandedId={expandedClientId}
          />
        </motion.div>
      )}

      {modalMode && (
        <ClientModal
          isOpen={!!modalMode}
          mode={modalMode}
          client={modalClient}
          onClose={() => setModalMode("")}
        />
      )}
    </div>
  );
});

export default ClientsPage;
