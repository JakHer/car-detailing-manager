import { observer } from "mobx-react-lite";
import { useState, useMemo } from "react";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import { ordersStore, type OrderStatus } from "../../stores/OrdersStore";
import ClientModal from "./ClientModal";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import { FiEdit, FiEye, FiEyeOff, FiTrash2, FiUserPlus } from "react-icons/fi";
import ExpandableTable, {
  type ExpandableTableColumn,
} from "../../components/ExpandableTable/ExpandableTable";
import FilterBar from "../../components/FilterBar/FilterBar";
import { STATUS_COLORS } from "../../components/Card/Card";
import PageHeader from "../../components/PageHeader/PageHeader";
import { HiUsers } from "react-icons/hi";

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

  const columns: ExpandableTableColumn<Client>[] = useMemo(
    () => [
      {
        header: "Imię",
        accessor: (c) => c.name,
        render: (c) => <span className="font-medium">{c.name}</span>,
        enableSorting: true,
      },
      {
        header: "Telefon",
        accessor: (c) => c.phone || "",
        render: (c) => c.phone || "-",
        enableSorting: true,
      },
      {
        header: "Email",
        accessor: (c) => c.email || "",
        render: (c) => (
          <span className="truncate max-w-[180px] block">{c.email || "-"}</span>
        ),
        enableSorting: true,
      },
      {
        header: "Ostatnie zamówienie",
        accessor: (c) => {
          const orders = ordersStore.orders
            .filter((o) => o.client.id === c.id)
            .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
          return orders.length
            ? new Date(orders[orders.length - 1].createdAt).getTime()
            : 0;
        },
        render: (c) => {
          const orders = ordersStore.orders
            .filter((o) => o.client.id === c.id)
            .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
          return orders.length
            ? new Date(orders[orders.length - 1].createdAt).toLocaleDateString()
            : "-";
        },
        enableSorting: true,
      },
      {
        header: "Przychód",
        accessor: (c) => {
          const orders = ordersStore.orders.filter(
            (o) => o.client.id === c.id && o.status === "Zakończone"
          );
          return orders.reduce(
            (sum, o) => sum + o.services.reduce((s, srv) => s + srv.price, 0),
            0
          );
        },
        render: (c) => {
          const orders = ordersStore.orders.filter(
            (o) => o.client.id === c.id && o.status === "Zakończone"
          );
          const total = orders.reduce(
            (sum, o) => sum + o.services.reduce((s, srv) => s + srv.price, 0),
            0
          );
          return (
            <span
              className={`font-medium ${
                total > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400"
              }`}
            >
              {total > 0 ? `${total.toFixed(2)} zł` : "-"}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        header: "Notatki",
        accessor: (c) => c.notes || "",
        render: (c) => (
          <span
            className="italic text-gray-500 dark:text-gray-400 max-w-[180px] truncate block"
            title={c.notes || "-"}
          >
            {c.notes || "-"}
          </span>
        ),
      },
    ],
    []
  );

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
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-400 rounded mt-2 truncate">
        <div className="grid grid-cols-4 gap-4 p-2 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200">
          <span>Data</span>
          <span>Suma</span>
          <span>Status</span>
          <span>Notatki</span>
        </div>

        {clientOrders.length === 0 ? (
          <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
            Brak zamówień
          </div>
        ) : (
          <div className="space-y-1">
            {clientOrders.map((order, idx) => (
              <div
                key={order.id}
                className={`grid grid-cols-4 gap-4 p-2 ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-700"
                    : "bg-gray-100 dark:bg-gray-600"
                } text-gray-700 dark:text-gray-200 overflow-x-auto whitespace-nowrap block`}
              >
                <span className="truncate text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>

                <span className="font-medium whitespace-nowrap truncate">
                  {order.services.reduce((sSum, s) => sSum + s.price, 0)} zł
                </span>

                <div className="flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
                  <span
                    className={`ml-5 inline-block w-3 h-3 rounded-full mr-2 sm:hidden ${
                      STATUS_COLORS[order.status as OrderStatus]?.bg
                    }`}
                    title={order.status}
                    aria-label={order.status}
                  />

                  <span
                    className={`hidden sm:inline-block px-2 py-0.5 text-sm font-semibold rounded ${
                      STATUS_COLORS[order.status as OrderStatus]?.bg
                    } ${STATUS_COLORS[order.status as OrderStatus]?.text}`}
                    title={order.status}
                  >
                    {order.status}
                  </span>
                </div>

                <span
                  className="italic text-gray-500 dark:text-gray-400 truncate block"
                  title={order.notes || "-"}
                >
                  {order.notes || "-"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 p-2 bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-gray-100 border-t border-gray-400 dark:border-gray-600">
          <span>Razem:</span>
          <span></span>
          <span>{totalRevenue.toFixed(2)} zł</span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  };

  const renderActions = (client: Client) => {
    const clientOrders = ordersStore.orders.filter(
      (o) => o.client.id === client.id
    );
    return (
      <ButtonGroup align="right">
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
          variant="secondary"
          title="Edytuj klienta"
          onClick={() => openModal(client, "edit")}
        >
          <FiEdit className="w-4 h-4" />
        </Button>

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
      <PageHeader
        icon={<HiUsers />}
        title="Klienci"
        subtitle="Zarządzaj klientami i ich danymi"
        rightContent={
          <Button
            onClick={() => openModal(null, "add")}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiUserPlus />
          </Button>
        }
      />

      <FilterBar
        searchValue={clientsStore.searchTerm}
        onSearchChange={(v) => clientsStore.setFilters({ searchTerm: v })}
        dateFrom={clientsStore.dateFrom}
        dateTo={clientsStore.dateTo}
        onDateFromChange={(v) => clientsStore.setFilters({ dateFrom: v })}
        onDateToChange={(v) => clientsStore.setFilters({ dateTo: v })}
        onReset={() => clientsStore.resetFilters()}
      />

      {clientsStore.filteredClients.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          Brak klientów — kliknij{" "}
          <span className="text-cyan-500 font-medium">+</span> aby rozpocząć.
        </p>
      ) : (
        <ExpandableTable
          data={clientsStore.filteredClients}
          columns={columns}
          keyField="id"
          renderExpanded={renderExpanded}
          renderActions={renderActions}
          expandedId={expandedClientId}
        />
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
