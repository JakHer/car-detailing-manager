import { observer } from "mobx-react-lite";
import { useState, useMemo, useEffect } from "react";
import { clientsStore, type Client, type Car } from "../../stores/ClientsStore";
import { ordersStore } from "../../stores/OrdersStore";
import ClientModal from "./ClientModal";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import {
  FiEdit,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiUserPlus,
  FiPlus,
} from "react-icons/fi";
import ExpandableTable, {
  type ExpandableTableColumn,
} from "../../components/ExpandableTable/ExpandableTable";
import FilterBar from "../../components/FilterBar/FilterBar";
import { STATUS_COLORS } from "../../components/Card/Card";
import PageHeader from "../../components/PageHeader/PageHeader";
import { HiUsers } from "react-icons/hi";
import Loader from "../../components/Loader/Loader";

const ClientsPage = observer(() => {
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "delete" | "addCar" | "editCar" | "deleteCar" | ""
  >("");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    void clientsStore.fetchAllClients();
  }, []);

  const openModal = (
    client: Client | null,
    car: Car | null,
    mode: "add" | "edit" | "delete" | "addCar" | "editCar" | "deleteCar"
  ) => {
    setModalClient(client);
    setSelectedCar(car);
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
        header: "Samochody",
        accessor: (c) => c.cars.length,
        render: (c) => c.cars.length ?? (c.cars.length || 0),
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
      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-gray-400 rounded p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span>Samochody</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => openModal(client, null, "addCar")}
              title="Dodaj samochód"
            >
              <FiPlus className="w-4 h-4" />
            </Button>
          </h4>
          {client.cars.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-2">
              Brak samochodów
            </p>
          ) : (
            <div className="space-y-2">
              {client.cars.map((car) => (
                <div
                  key={car.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {car.make} {car.model}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({car.license_plate})
                    </span>
                    {car.color && (
                      <span className="px-2 py-0.5 bg-gray-200 light:text-gray-600 dark:bg-gray-600 rounded text-xs">
                        {car.color}
                      </span>
                    )}
                  </div>
                  <ButtonGroup align="right">
                    <Button
                      size="icon"
                      variant="secondary"
                      title="Edytuj samochód"
                      onClick={() => openModal(client, car, "editCar")}
                    >
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Usuń samochód"
                      onClick={() => openModal(client, car, "deleteCar")}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </ButtonGroup>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-400 rounded">
          <div className="grid grid-cols-5 gap-4 p-2 bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200">
            <span>Data</span>
            <span>Samochód</span>
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
                  className={`grid grid-cols-5 gap-4 p-2 ${
                    idx % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "bg-gray-100 dark:bg-gray-600"
                  } text-gray-700 dark:text-gray-200 overflow-x-auto whitespace-nowrap block`}
                >
                  <span className="truncate text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>

                  <span className="truncate text-sm">
                    {order.car?.make} {order.car?.model} (
                    {order.car?.license_plate})
                  </span>

                  <span className="font-medium whitespace-nowrap truncate">
                    {order.services.reduce((sSum, s) => sSum + s.price, 0)} zł
                  </span>

                  <div className="flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
                    <span
                      className={`ml-5 inline-block w-3 h-3 rounded-full mr-2 sm:hidden ${
                        STATUS_COLORS[order.status]?.bg
                      }`}
                      title={order.status}
                      aria-label={order.status}
                    />

                    <span
                      className={`hidden sm:inline-block px-2 py-0.5 text-sm font-semibold rounded ${
                        STATUS_COLORS[order.status]?.bg
                      } ${STATUS_COLORS[order.status]?.text}`}
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
                ? "Ukryj szczegóły"
                : "Pokaż szczegóły"
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
          onClick={() => openModal(client, null, "edit")}
        >
          <FiEdit className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          title="Usuń klienta"
          onClick={() => openModal(client, null, "delete")}
        >
          <FiTrash2 className="w-4 h-4" />
        </Button>
      </ButtonGroup>
    );
  };

  if (clientsStore.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader
          text="Ładowanie klientów..."
          size="lg"
          icon={<HiUsers className="w-8 h-8 text-indigo-500" />}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<HiUsers />}
        title="Klienci"
        subtitle="Zarządzaj klientami i ich danymi"
        rightContent={
          <Button
            onClick={() => openModal(null, null, "add")}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiUserPlus />
            Dodaj klienta
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
          car={selectedCar}
          onClose={() => {
            setModalMode("");
            setModalClient(null);
            setSelectedCar(null);
          }}
        />
      )}
    </div>
  );
});

export default ClientsPage;
