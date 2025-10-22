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

export const STATUS_OPTIONS: OrderStatus[] = [
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

  const toggleExpand = (id: number) =>
    setExpandedOrderId(expandedOrderId === id ? null : id);

  const columns: ExpandableTableColumn<Order>[] = [
    {
      id: "client",
      header: "Klient",
      accessor: (o) => o.client.name,
      render: (o) => o.client.name,
      enableSorting: true,
    },
    {
      id: "phone",
      header: "Telefon",
      accessor: (o) => o.client.phone || "-",
      render: (o) => o.client.phone || "-",
    },
    {
      id: "createdAt",
      header: "Data",
      accessor: (o) => new Date(o.createdAt).getTime(),
      render: (o) => new Date(o.createdAt).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: "totalPrice",
      header: "Łączna cena",
      accessor: (o) => o.services.reduce((s, srv) => s + srv.price, 0),
      render: (o) => o.services.reduce((s, srv) => s + srv.price, 0) + " zł",
      enableSorting: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (o) => o.status,
      render: (o) => (
        <span
          className={`truncate overflow-hidden whitespace-nowrap inline-block px-2 py-0.5 text-sm font-semibold rounded ${
            STATUS_COLORS[o.status]?.bg
          } ${STATUS_COLORS[o.status]?.text}`}
        >
          {o.status}
        </span>
      ),
      enableSorting: true,
    },
  ];

  const renderExpanded = (order: Order) => {
    return (
      <div className="space-y-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Status:
          </span>
          <select
            value={order.status}
            onChange={(e) =>
              handleStatusChange(order, e.target.value as OrderStatus)
            }
            className="mt-1 sm:mt-0 text-sm w-full sm:w-auto max-w-[180px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Notatki:
          </span>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            {order.notes || "Brak notatek"}
          </p>
        </div>

        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            Usługi:
          </span>
          <table className="mt-2 text-gray-600 dark:text-gray-300 table-auto w-max">
            <tbody>
              {order.services.map((s) => (
                <tr key={s.id} className="align-top">
                  <td className="pr-4 break-words max-w-[200px]">{s.name}</td>
                  <td className="font-medium text-right whitespace-nowrap">
                    {s.price} zł
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
        {expandedOrderId === order.id ? <FiEyeOff /> : <FiEye />}
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => openModal(order, "edit")}
        title="Edytuj zlecenie"
      >
        <FiEdit />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => openModal(order, "delete")}
        title="Usuń zlecenie"
      >
        <FiTrash2 />
      </Button>
    </ButtonGroup>
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
          <FiPlus />
        </Button>
      </div>

      {ordersStore.orders.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          Brak zleceń — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </p>
      ) : (
        <ExpandableTable
          data={[...ordersStore.sortedOrders]}
          columns={columns}
          keyField="id"
          renderExpanded={renderExpanded}
          renderActions={renderActions}
          expandedId={expandedOrderId}
        />
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
