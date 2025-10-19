import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  ordersStore,
  type Order,
  type OrderStatus,
} from "../../stores/OrdersStore";
import Card from "../../components/Card/Card";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import PageSection from "../../layouts/PageSection/PageSection";
import OrderModal from "./OrderModal";
import { FiEdit, FiTrash2, FiPlus, FiEye, FiEyeOff } from "react-icons/fi";

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

  const toggleExpand = (id: number) =>
    setExpandedOrderId(expandedOrderId === id ? null : id);

  const openModal = (order: Order | null, mode: "add" | "edit" | "delete") => {
    setModalOrder(order);
    setModalMode(mode);
  };

  const closeModal = () => {
    setModalOrder(null);
    setModalMode("");
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    ordersStore.updateOrder(order.id, { status: newStatus });
  };

  const sortedOrders = ordersStore.orders.slice().sort((a, b) => b.id - a.id);

  return (
    <PageSection
      title="Zlecenia"
      action={
        <Button
          onClick={() => openModal(null, "add")}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
        </Button>
      }
    >
      {sortedOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-gray-500 dark:text-gray-400"
        >
          Brak zleceń — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </motion.div>
      )}

      <AnimatePresence>
        {sortedOrders.map((order, index) => {
          const totalPrice = order.services.reduce(
            (sum, s) => sum + s.price,
            0
          );

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card title={order.client.name} status={order.status}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                  <span className="font-bold">Data zlecenia:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>

                  <span className="font-bold">Łączna cena:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {totalPrice} zł
                  </span>

                  <span className="font-bold">Usługi:</span>
                  <span className="truncate">
                    {order.services.map((s) => s.name).join(", ")}
                  </span>
                </div>

                {/* Status dropdown */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-sm font-bold mr-2">Status:</label>
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

                {/* Buttons */}
                <ButtonGroup align="right">
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
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleExpand(order.id)}
                    title={
                      expandedOrderId === order.id
                        ? "Ukryj szczegóły"
                        : "Pokaż szczegóły"
                    }
                  >
                    {expandedOrderId === order.id ? (
                      <>
                        <FiEyeOff className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <FiEye className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </ButtonGroup>

                {/* Expandable details */}
                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ originY: 0 }}
                      className="mt-2 border-t pt-2 text-sm text-gray-700 dark:text-gray-300 overflow-hidden"
                    >
                      <p>
                        {order.notes
                          ? `Notatki: ${order.notes}`
                          : "Brak notatek"}
                      </p>
                      <ul className="list-disc list-inside mt-1">
                        {order.services.map((s) => (
                          <li key={s.id}>
                            {s.name} — {s.price} zł
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {modalMode && (
        <OrderModal
          isOpen={!!modalMode}
          mode={modalMode as "add" | "edit" | "delete"}
          order={modalOrder}
          onClose={closeModal}
        />
      )}
    </PageSection>
  );
});

export default OrdersPage;
