import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  ordersStore,
  type Order,
  type OrderStatus,
} from "../../stores/OrdersStore";
import ExpandableTable, {
  type ExpandableTableColumn,
} from "../../components/ExpandableTable/ExpandableTable";
import OrderModal from "./OrderModal";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiPlus } from "react-icons/fi";
import { STATUS_COLORS } from "../../components/Card/Card";
import { motion } from "framer-motion";

const STATUS_OPTIONS: OrderStatus[] = [
  "Nowe",
  "Przyjęte",
  "W toku",
  "Czeka na odbiór",
  "Zakończone",
  "Anulowane",
];

const OrdersPage = observer(() => {
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "">(
    ""
  );
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const openModal = (order: Order | null, mode: "add" | "edit" | "delete") => {
    setModalOrder(order);
    setModalMode(mode);
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    ordersStore.updateOrder(order.id, { status: newStatus });
  };

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const columns: ExpandableTableColumn<Order>[] = [
    { header: "Klient", render: (o) => o.client.name },
    { header: "Telefon", render: (o) => o.client.phone || "-" },
    {
      header: "Data",
      render: (o) => new Date(o.createdAt).toLocaleDateString(),
    },
    {
      header: "Łączna cena",
      render: (o) => o.services.reduce((s, srv) => s + srv.price, 0) + " zł",
    },
    {
      header: "Status",
      render: (order) => (
        <span
          className={`truncate overflow-hidden whitespace-nowrap inline-block px-2 py-0.5 text-sm font-semibold rounded ${
            STATUS_COLORS[order.status as OrderStatus]?.bg
          } ${STATUS_COLORS[order.status as OrderStatus]?.text}`}
          style={{ maxWidth: "100%" }}
        >
          {order.status}
        </span>
      ),
    },
  ];

  const renderExpanded = (order: Order) => (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold">Status:</span>
        <select
          value={order.status}
          onChange={(e) =>
            handleStatusChange(order, e.target.value as OrderStatus)
          }
          className="text-sm w-auto max-w-[150px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <p>{order.notes ? `Notatki: ${order.notes}` : "Brak notatek"}</p>
      <ul className="list-disc list-inside">
        {order.services.map((s) => (
          <li key={s.id}>
            {s.name} — {s.price} zł
          </li>
        ))}
      </ul>
    </div>
  );

  const renderActions = (order: Order) => (
    <ButtonGroup align="right">
      <Button
        size="icon"
        variant="outline"
        onClick={() => toggleExpand(order.id)}
        title={
          expandedOrderId === order.id ? "Ukryj szczegóły" : "Pokaż szczegóły"
        }
      >
        {expandedOrderId === order.id ? (
          <FiEyeOff className="w-4 h-4" />
        ) : (
          <FiEye className="w-4 h-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => openModal(order, "edit")}
        title="Edytuj zlecenie"
      >
        <FiEdit className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => openModal(order, "delete")}
        title="Usuń zlecenie"
      >
        <FiTrash2 className="w-4 h-4" />
      </Button>
    </ButtonGroup>
  );

  const sortedOrders = ordersStore.orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Zlecenia</h1>
        <Button
          onClick={() => openModal(null, "add")}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
        </Button>
      </div>

      {sortedOrders.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          Brak zleceń — kliknij{" "}
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
            data={sortedOrders}
            columns={columns}
            keyField="id"
            renderExpanded={renderExpanded}
            renderActions={renderActions}
            expandedId={expandedOrderId}
          />
        </motion.div>
      )}

      {modalMode && (
        <OrderModal
          isOpen={!!modalMode}
          mode={modalMode as "add" | "edit" | "delete"}
          order={modalOrder}
          onClose={() => setModalMode("")}
        />
      )}
    </div>
  );
});

export default OrdersPage;
