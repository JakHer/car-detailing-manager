import { observer } from "mobx-react-lite";
import { useState, useMemo, useEffect } from "react";
import { carStore, type Car } from "../../stores/CarStore";
import { clientsStore, type Client } from "../../stores/ClientsStore";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import { FiPlus, FiEdit, FiTrash2, FiEyeOff, FiEye } from "react-icons/fi";
import Loader from "../../components/Loader/Loader";
import PageHeader from "../../components/PageHeader/PageHeader";
import type { ExpandableTableColumn } from "../../components/ExpandableTable/ExpandableTable";
import ExpandableTable from "../../components/ExpandableTable/ExpandableTable";
import FilterBar from "../../components/FilterBar/FilterBar";
import { HiTruck } from "react-icons/hi2";
import CarModal from "./CarsModal";

const CarsPage = observer(() => {
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete" | "">(
    ""
  );
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void carStore.fetchAllCars();
  }, []);

  const openModal = (car: Car | null, mode: "add" | "edit" | "delete") => {
    setSelectedCar(car);
    setModalMode(mode);
  };

  const columns: ExpandableTableColumn<Car>[] = useMemo(
    () => [
      {
        header: "Marka/Model",
        accessor: (car) => `${car.make} ${car.model}`,
        render: (car) => (
          <span className="font-medium">
            {car.make} {car.model}
          </span>
        ),
        enableSorting: true,
      },
      {
        header: "Klient",
        accessor: (car) => {
          const client = clientsStore.clients.find(
            (c: Client) => c.id === car.client_id
          );
          return client?.name || "";
        },
        render: (car) => {
          const client = clientsStore.clients.find(
            (c: Client) => c.id === car.client_id
          );
          return <span className="font-medium">{client?.name || "-"}</span>;
        },
        enableSorting: true,
      },
      {
        header: "Nr rejestracyjny",
        accessor: (car) => car.license_plate || "",
        render: (car) => car.license_plate || "-",
        enableSorting: true,
      },
      {
        header: "Kolor",
        accessor: (car) => car.color || "",
        render: (car) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              car.color ? "bg-gray-200 dark:bg-gray-600" : ""
            }`}
          >
            {car.color || "-"}
          </span>
        ),
        enableSorting: true,
      },
      {
        header: "Rok",
        accessor: (car) => car.year || 0,
        render: (car) => car.year?.toString() || "-",
        enableSorting: true,
      },
      {
        header: "Notatki",
        accessor: (car) => car.notes || "",
        render: (car) => (
          <span
            className="italic text-gray-500 dark:text-gray-400 max-w-[180px] truncate block"
            title={car.notes || "-"}
          >
            {car.notes || "-"}
          </span>
        ),
      },
    ],
    []
  );

  const renderActions = (car: Car) => (
    <ButtonGroup align="right">
      <Button
        size="icon"
        variant="outline"
        title={expandedId === car.id ? "Ukryj szczegóły" : "Pokaż szczegóły"}
        onClick={() => setExpandedId(expandedId === car.id ? null : car.id)}
      >
        {expandedId === car.id ? (
          <FiEyeOff className="w-4 h-4" />
        ) : (
          <FiEye className="w-4 h-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => openModal(car, "edit")}
      >
        <FiEdit className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => openModal(car, "delete")}
      >
        <FiTrash2 className="w-4 h-4" />
      </Button>
    </ButtonGroup>
  );

  const renderExpanded = (car: Car) => {
    const client = clientsStore.clients.find(
      (c: Client) => c.id === car.client_id
    );
    return (
      <div className="p-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Klient:</span>{" "}
          {client?.name || "Brak"}
        </p>
        <p>
          <span className="font-semibold">Utworzono:</span>{" "}
          {new Date(car.created_at).toLocaleString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p>
          <span className="font-semibold">Zaktualizowano:</span>{" "}
          {new Date(car.updated_at).toLocaleString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {car.notes && (
          <p className="whitespace-pre-line break-words max-w-lg">
            <span className="font-semibold">Pełne notatki:</span> {car.notes}
          </p>
        )}
      </div>
    );
  };

  const handleAddCar = () => {
    openModal(null, "add");
  };

  if (carStore.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader
          text="Ładowanie samochodów..."
          size="lg"
          icon={<HiTruck className="w-8 h-8 text-indigo-500" />}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<HiTruck />}
        title="Samochody"
        subtitle="Zarządzaj pojazdami klientów"
        rightContent={
          <Button
            onClick={handleAddCar}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus />
            Dodaj samochód
          </Button>
        }
      />

      <FilterBar
        searchValue={carStore.searchTerm}
        onSearchChange={(v) => carStore.setFilters({ searchTerm: v })}
        dateFrom={carStore.dateFrom}
        dateTo={carStore.dateTo}
        onDateFromChange={(v) => carStore.setFilters({ dateFrom: v })}
        onDateToChange={(v) => carStore.setFilters({ dateTo: v })}
        onReset={() => carStore.resetFilters()}
      />

      {carStore.filteredCars.length === 0 ? (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          Brak samochodów — dodaj pierwszy.
        </p>
      ) : (
        <ExpandableTable
          data={carStore.filteredCars}
          columns={columns}
          keyField="id"
          renderExpanded={renderExpanded}
          renderActions={renderActions}
          expandedId={expandedId}
        />
      )}

      {modalMode && (
        <CarModal
          isOpen={!!modalMode}
          mode={modalMode}
          car={selectedCar}
          clientId={null}
          onClose={() => {
            setModalMode("");
            setSelectedCar(null);
          }}
        />
      )}
    </div>
  );
});

export default CarsPage;
