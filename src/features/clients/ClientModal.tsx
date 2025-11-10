import { clientsStore, type Client, type Car } from "../../stores/ClientsStore";
import { toast } from "react-hot-toast";
import BaseModal from "../../components/BaseModal/BaseModal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { carStore } from "../../stores/CarStore";
import { FormField } from "../../components/FormField/FormField";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  car?: Car | null;
  mode?: "add" | "edit" | "delete" | "addCar" | "editCar" | "deleteCar";
}

type ClientInput = Pick<Client, "name" | "phone" | "email" | "notes">;
type CarInput = Pick<
  Car,
  "make" | "model" | "license_plate" | "color" | "year" | "notes"
>;

const ClientSchema = Yup.object().shape({
  name: Yup.string().required("Imię i nazwisko jest wymagane"),
  phone: Yup.string()
    .matches(/^[0-9+\s-]*$/, "Telefon może zawierać tylko cyfry, spacje, + i -")
    .optional(),
  email: Yup.string().email("Niepoprawny email").optional(),
  notes: Yup.string().optional(),
});

const CarSchema = Yup.object().shape({
  make: Yup.string().required("Marka samochodu jest wymagana"),
  model: Yup.string().required("Model samochodu jest wymagany"),
  license_plate: Yup.string()
    .matches(/^[A-Z0-9\s-]{2,8}$/, "Niepoprawny format numeru rejestracyjnego")
    .optional(),
  color: Yup.string().optional(),
  year: Yup.number()
    .min(1900, "Rok nie może być wcześniejszy niż 1900")
    .max(
      new Date().getFullYear() + 1,
      "Rok nie może być późniejszy niż przyszły rok"
    )
    .optional(),
  notes: Yup.string().optional(),
});

const ClientModal = ({
  isOpen,
  onClose,
  client,
  car,
  mode = "add",
}: ClientModalProps) => {
  const isClientMode = ["add", "edit", "delete"].includes(mode);
  const isCarMode = ["addCar", "editCar", "deleteCar"].includes(mode);

  const initialValues = isClientMode
    ? {
        name: client?.name || "",
        phone: client?.phone || "",
        email: client?.email || "",
        notes: client?.notes || "",
      }
    : {
        make: car?.make || "",
        model: car?.model || "",
        license_plate: car?.license_plate || "",
        color: car?.color || "",
        year: car?.year || "",
        notes: car?.notes || "",
      };

  const validationSchema = isClientMode ? ClientSchema : CarSchema;

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (isClientMode) {
        const clientValues: ClientInput = {
          name: values.name || "",
          phone: values.phone || "",
          email: values.email || "",
          notes: values.notes || "",
        };

        if (mode === "edit") {
          if (!client) {
            toast.error("Brak danych klienta do edycji");
            return;
          }
          await clientsStore.updateClient(client.id, clientValues);
        } else if (mode === "add") {
          await clientsStore.addClient(clientValues);
        }
      } else if (isCarMode) {
        const carValues: CarInput = {
          make: values.make,
          model: values.model,
          license_plate: values.license_plate,
          color: values.color,
          year: values.year ? Number(values.year) : undefined,
          notes: values.notes,
        };

        if (mode === "editCar") {
          if (!car) {
            toast.error("Brak danych samochodu do edycji");
            return;
          }
          await carStore.updateCar(car.id, carValues);
        } else if (mode === "addCar") {
          if (!client) {
            toast.error("Brak klienta do dodania samochodu");
            return;
          }
          await carStore.addCar(client.id, carValues);
        }

        await clientsStore.fetchAllClients();
      }

      toast.success(
        mode === "add" || mode === "addCar"
          ? "Dodano pomyślnie"
          : "Zaktualizowano pomyślnie"
      );
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Nieznany błąd";
      toast.error(`Błąd podczas zapisywania: ${message}`);
      console.error("Modal submit error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (isClientMode && client) {
        await clientsStore.deleteClient(client.id);
        toast.success("Klient usunięty");
      } else if (isCarMode && car) {
        await carStore.deleteCar(car.id);
        await clientsStore.fetchAllClients();
        toast.success("Samochód usunięty");
      } else {
        toast.error("Brak danych do usunięcia");
        return;
      }
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Nieznany błąd";
      toast.error(`Błąd podczas usuwania: ${message}`);
      console.error("Modal delete error:", error);
    }
  };

  const title =
    mode === "add"
      ? "Dodaj klienta"
      : mode === "edit"
      ? "Edytuj klienta"
      : mode === "delete"
      ? "Usuń klienta"
      : mode === "addCar"
      ? "Dodaj samochód"
      : mode === "editCar"
      ? "Edytuj samochód"
      : "Usuń samochód";

  if (["delete", "deleteCar"].includes(mode)) {
    const entityName = isClientMode ? "klienta" : "samochód";
    const entityDisplay = isClientMode
      ? client?.name
      : `${car?.make} ${car?.model}`;
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        mode={mode}
        renderBody={() => (
          <p className="dark:text-gray-100">
            Czy na pewno chcesz usunąć {entityName}{" "}
            <span className="font-semibold">{entityDisplay}</span>?
          </p>
        )}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange
    >
      {({ submitForm }) => (
        <BaseModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          mode={mode}
          onSave={() => submitForm()}
          renderBody={() => (
            <Form className="flex flex-col space-y-4 m-1">
              {isClientMode ? (
                <>
                  <FormField name="name" placeholder="Imię i nazwisko" />
                  <FormField name="phone" placeholder="Telefon" />
                  <FormField name="email" type="email" placeholder="Email" />
                  <FormField as="textarea" name="notes" placeholder="Notatki" />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField name="make" placeholder="Marka" />
                    <FormField name="model" placeholder="Model" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="license_plate"
                      placeholder="Nr rejestracyjny"
                    />
                    <FormField name="color" placeholder="Kolor" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField name="year" type="number" placeholder="Rok" />
                    <div className="col-span-1" />
                  </div>
                  <FormField
                    as="textarea"
                    name="notes"
                    placeholder="Notatki o samochodzie"
                  />
                </>
              )}
            </Form>
          )}
        />
      )}
    </Formik>
  );
};

export default ClientModal;
